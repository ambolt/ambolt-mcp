import { readFileSync } from 'node:fs';
import { resolveMx } from 'node:dns/promises';
import { defineFunction } from '../../src/core/define.js';

const list = JSON.parse(readFileSync(new URL('./domains.json', import.meta.url), 'utf8'));
const DISPOSABLE = new Set(list.domains);
const ROLES = new Set(['admin', 'administrator', 'info', 'support', 'sales', 'contact', 'hello', 'office', 'postmaster', 'webmaster', 'noreply', 'no-reply', 'abuse', 'billing', 'hostmaster']);
const POPULAR = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'msn.com', 'aol.com', 'protonmail.com', 'gmx.com', 'mail.com', 'yahoo.dk', 'hotmail.dk', 'live.dk', 'mail.dk', 'me.com'];

const lev1 = (a, b) => { // true if edit distance <= 1 (insert, delete, substitute or adjacent swap)
  if (a === b) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const A = a.slice(i), B = b.slice(i);
  return A.slice(1) === B || A === B.slice(1) || A.slice(1) === B.slice(1) || (A.length > 1 && B.length > 1 && A[0] === B[1] && A[1] === B[0] && A.slice(2) === B.slice(2));
};
const SYNTAX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export default defineFunction({
  id: 'disposable-email-check',
  title: 'Disposable Email Checker: Syntax, MX and Role Addresses',
  description: 'Fast email address check without sending anything: syntax, domain MX records, disposable/temporary-mail domain (9,000+ listed), role address (info@, admin@) and likely typo of a popular provider. Does not confirm that a mailbox exists.',
  keywords: ['email validation', 'disposable email', 'temporary email', 'MX record', 'role account', 'typo', 'signup'],
  input: {
    type: 'object', required: ['email'], additionalProperties: false,
    properties: { email: { type: 'string', maxLength: 254, description: 'Email address to check.' } },
  },
  pii: { allow: ['email'] }, // the caller's own address is echoed back
  price: { usd: 0.002, apifyEvent: 'check' },
  sample: { email: 'someone@mailinator.com' },
  healthCheck: out => out.syntaxValid === true && out.disposable === true && out.hasMx === true,
  async handler({ email }, { resolveMx: mx = resolveMx, now }) {
    const e = email.trim();
    const base = { email: e, checkedAt: now().toISOString(), disposableListSource: `disposable-email-domains (${list.license}), ${list.fetchedAt.slice(0, 10)}` };
    if (!SYNTAX.test(e)) return { ...base, syntaxValid: false, deliverableEstimate: 'invalid' };
    const [local, domainRaw] = e.split('@'); const domain = domainRaw.toLowerCase();
    let hasMx = false, dnsError = null;
    try { hasMx = (await mx(domain)).length > 0; }
    catch (err) { if (!['ENOTFOUND', 'ENODATA'].includes(err.code)) dnsError = err.code ?? 'dns-error'; }
    const disposable = DISPOSABLE.has(domain) || [...DISPOSABLE].some(d => domain.endsWith('.' + d));
    const role = ROLES.has(local.toLowerCase());
    const typo = POPULAR.includes(domain) ? null : POPULAR.find(p => lev1(domain, p)) ?? null; // a popular domain is never a typo of another
    const estimate = dnsError ? 'unknown' : !hasMx ? 'invalid' : disposable ? 'risky' : typo ? 'risky' : role ? 'risky' : 'plausible';
    return { ...base, syntaxValid: true, domain, hasMx, disposable, roleAddress: role, typoSuggestion: typo ? `${local}@${typo}` : null, dnsError, deliverableEstimate: estimate };
  },
});
