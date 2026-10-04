import { resolve4, resolve6, resolveMx, resolveTxt, resolveNs, resolveCname } from 'node:dns/promises';
import { defineFunction } from '../../src/core/define.js';

const TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'];
const ok = (e) => ['ENODATA', 'ENOTFOUND'].includes(e.code);
const get = async (fn, ...a) => { try { return await fn(...a); } catch (e) { if (ok(e)) return []; throw e; } };

export default defineFunction({
  id: 'dns-lookup',
  title: 'DNS Lookup: A, MX, TXT, NS Records with SPF and DMARC Check',
  description: 'Resolve public DNS records for a domain (A, AAAA, MX, TXT, NS, CNAME) and report whether SPF and DMARC records are present, with their policies. DNS queries only; no connection is made to the domain itself.',
  keywords: ['DNS', 'MX', 'SPF', 'DMARC', 'TXT record', 'domain', 'email deliverability'],
  input: {
    type: 'object', required: ['domain'], additionalProperties: false,
    properties: {
      domain: { type: 'string', maxLength: 253, pattern: '^(?=.{1,253}$)([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+[A-Za-z]{2,63}$', description: 'Domain name, e.g. example.com.' },
      types: { type: 'array', maxItems: 6, items: { type: 'string', enum: TYPES }, description: 'Record types. Default: all.' },
    },
  },
  pii: { allow: ['email'] }, // 'email' is the SPF/DMARC deliverability section, not an address
  price: { usd: 0.002, apifyEvent: 'lookup' },
  sample: { domain: 'example.com' },
  healthCheck: out => out.records.A?.length > 0 && out.records.NS?.length > 0,
  async handler({ domain, types }, { now, dns = { resolve4, resolve6, resolveMx, resolveTxt, resolveNs, resolveCname } }) {
    const want = new Set(types?.length ? types : TYPES);
    const records = {};
    const jobs = {
      A: () => get(dns.resolve4, domain), AAAA: () => get(dns.resolve6, domain),
      MX: async () => (await get(dns.resolveMx, domain)).sort((a, b) => a.priority - b.priority),
      TXT: async () => (await get(dns.resolveTxt, domain)).map(p => p.join('')),
      NS: () => get(dns.resolveNs, domain), CNAME: () => get(dns.resolveCname, domain),
    };
    await Promise.all([...want].map(async t => { records[t] = await jobs[t](); }));
    const txt = records.TXT ?? (await jobs.TXT());
    const spf = txt.find(t => /^v=spf1\b/i.test(t)) ?? null;
    const dmarcTxt = (await get(dns.resolveTxt, `_dmarc.${domain}`)).map(p => p.join('')).find(t => /^v=DMARC1\b/i.test(t)) ?? null;
    return {
      domain, records,
      email: {
        spf: spf ? { record: spf, allMechanism: (spf.match(/[~?+-]all\b/) ?? [null])[0] } : null,
        dmarc: dmarcTxt ? { record: dmarcTxt, policy: (dmarcTxt.match(/\bp=(\w+)/i) ?? [])[1] ?? null } : null,
      },
      resolvedAt: now().toISOString(),
    };
  },
});
