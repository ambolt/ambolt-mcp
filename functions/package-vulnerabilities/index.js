import { defineFunction, InputError } from '../../src/core/define.js';

const sev = v => {
  const s = v.database_specific?.severity;
  return s ?? null;
};
const fixed = (v, name) => {
  for (const a of v.affected ?? []) if (a.package?.name?.toLowerCase() === name.toLowerCase())
    for (const r of a.ranges ?? []) for (const e of r.events ?? []) if (e.fixed) return e.fixed;
  return null;
};

export default defineFunction({
  id: 'package-vulnerabilities',
  title: 'Package Vulnerabilities: Known CVEs for npm and PyPI Versions',
  description: 'Check an npm or PyPI package version against a public vulnerability database: advisory ids, aliases (CVE, GHSA), summary, severity label and first fixed version, plus the latest published version. Informational; not a full security audit.',
  keywords: ['vulnerability', 'CVE', 'npm', 'PyPI', 'dependency', 'security advisory', 'supply chain'],
  input: {
    type: 'object', required: ['ecosystem', 'name'], additionalProperties: false,
    properties: {
      ecosystem: { type: 'string', enum: ['npm', 'PyPI'], description: 'Package ecosystem.' },
      name: { type: 'string', maxLength: 214, pattern: '^[@A-Za-z0-9._/-]+$', description: 'Package name, e.g. lodash or requests.' },
      version: { type: 'string', maxLength: 64, pattern: '^[A-Za-z0-9._+-]+$', description: 'Version to check. Default: latest published version.' },
    },
  },
  price: { usd: 0.003, apifyEvent: 'check' },
  sample: { ecosystem: 'npm', name: 'lodash', version: '4.17.20' },
  healthCheck: out => out.vulnerabilityCount > 0 && !!out.latestVersion,
  async handler({ ecosystem, name, version }, { fetch, now }) {
    const reg = ecosystem === 'npm' ? `https://registry.npmjs.org/${name.replace('/', '%2F')}/latest` : `https://pypi.org/pypi/${name}/json`;
    const r = await fetch(reg, { headers: { accept: 'application/json' } });
    if (r.status === 404) throw new InputError(`package ${name} not found in ${ecosystem}`);
    if (!r.ok) throw new Error(`upstream source returned HTTP ${r.status}`);
    const meta = await r.json();
    const latest = ecosystem === 'npm' ? meta.version : meta.info?.version;
    const deprecated = ecosystem === 'npm' ? (meta.deprecated ?? null) : null;
    const checked = version ?? latest;
    const o = await fetch('https://api.osv.dev/v1/query', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ package: { name, ecosystem }, version: checked }) });
    if (!o.ok) throw new Error(`upstream source returned HTTP ${o.status}`);
    const vulns = (await o.json()).vulns ?? [];
    return {
      ecosystem, name, checkedVersion: checked, latestVersion: latest, isLatest: checked === latest, deprecated,
      vulnerabilityCount: vulns.length,
      vulnerabilities: vulns.map(v => ({ id: v.id, aliases: v.aliases ?? [], summary: v.summary ?? null, severity: sev(v), firstFixedVersion: fixed(v, name), published: v.published ?? null, url: `https://osv.dev/vulnerability/${v.id}` })),
      checkedAt: now().toISOString(), source: 'Source: OSV.dev (CC BY 4.0 for most data) and the package registry. Not a complete audit: unreported issues are not listed.',
    };
  },
});
