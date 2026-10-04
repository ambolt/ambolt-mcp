import { defineFunction } from '../../src/core/define.js';

// Registered IBAN lengths per country (SWIFT IBAN registry). Unknown countries are checked by checksum only.
const LEN = { AD:24,AE:23,AL:28,AT:20,AZ:28,BA:20,BE:16,BG:22,BH:22,BR:29,BY:28,CH:21,CR:22,CY:28,CZ:24,DE:22,DK:18,DO:28,EE:20,EG:29,ES:24,FI:18,FO:18,FR:27,GB:22,GE:22,GI:23,GL:18,GR:27,GT:28,HR:21,HU:28,IE:22,IL:23,IQ:23,IS:26,IT:27,JO:30,KW:30,KZ:20,LB:28,LC:32,LI:21,LT:20,LU:20,LV:21,MC:27,MD:24,ME:22,MK:19,MR:27,MT:31,MU:30,NL:18,NO:15,PK:24,PL:28,PS:29,PT:25,QA:29,RO:24,RS:22,SA:24,SC:31,SE:24,SI:19,SK:24,SM:27,ST:25,SV:28,TL:23,TN:24,TR:26,UA:29,VA:22,VG:24,XK:20 };

export const mod97 = iban => {
  const s = iban.slice(4) + iban.slice(0, 4);
  let rem = 0;
  for (const ch of s) rem = Number(`${rem}${/\d/.test(ch) ? ch : ch.charCodeAt(0) - 55}`) % 97;
  return rem;
};

export default defineFunction({
  id: 'iban-validate',
  title: 'IBAN Validator: Checksum, Length and Country Check',
  description: 'Validate an IBAN offline: ISO 13616 checksum (mod 97), registered length for the country, and a normalised and grouped format. Does not check that the account exists.',
  keywords: ['IBAN', 'validation', 'bank account', 'checksum', 'SEPA', 'payments'],
  input: { type: 'object', required: ['iban'], additionalProperties: false, properties: { iban: { type: 'string', maxLength: 50, description: 'IBAN, spaces allowed.' } } },
  price: { usd: 0.001, apifyEvent: 'check' },
  sample: { iban: 'DK50 0040 0440 1162 43' },
  healthCheck: out => out.valid === true && out.country === 'DK',
  async handler({ iban }, { now }) {
    const n = iban.replace(/\s+/g, '').toUpperCase();
    const base = { input: iban, normalized: n, checkedAt: now().toISOString() };
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(n)) return { ...base, valid: false, reason: 'format' };
    const country = n.slice(0, 2), expected = LEN[country] ?? null;
    if (expected && n.length !== expected) return { ...base, valid: false, country, reason: 'length', expectedLength: expected };
    if (mod97(n) !== 1) return { ...base, valid: false, country, reason: 'checksum' };
    return { ...base, valid: true, country, length: n.length, countryKnown: expected !== null, grouped: n.replace(/(.{4})/g, '$1 ').trim(), checkDigits: n.slice(2, 4), bban: n.slice(4) };
  },
});
