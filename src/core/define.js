// A "function" is the unit of the factory: one handler, exposed three ways
// (Apify Actor, MCP tool, x402 endpoint). Everything else is generated from this definition.
import { validate } from './schema.js';

export function defineFunction(def) {
  for (const k of ['id', 'title', 'description', 'input', 'handler', 'price']) {
    if (def[k] === undefined) throw new Error(`function definition is missing "${k}"`);
  }
  if (!/^[a-z][a-z0-9-]*$/.test(def.id)) throw new Error(`bad function id: ${def.id}`);
  if (def.title.length > 63) throw new Error(`${def.id}: title is ${def.title.length} chars, Apify allows 63`);
  if (!(def.price.usd > 0)) throw new Error(`${def.id}: price.usd must be > 0`);
  return Object.freeze({
    channels: ['actor', 'mcp', 'x402'],
    requiresEnv: [],
    geoblock: false,
    ...def,
    mcpName: def.id.replace(/-/g, '_'),
    // Validate, then run. Errors from bad input are InputError (client's fault), anything else propagates.
    isAvailable: (env = process.env) => (def.requiresEnv ?? []).every(k => env[k]),
    async run(rawInput, ctx = {}) {
      const r = validate(def.input, rawInput ?? {});
      if (r.error) throw new InputError(r.error);
      // Every upstream call gets a time limit (20 s unless the function sets its own), so a hanging source fails fast instead of blocking.
      const timedFetch = (u, i = {}) => globalThis.fetch(u, { signal: AbortSignal.timeout(20_000), ...i });
      return def.handler(r.value, { fetch: timedFetch, now: () => new Date(), env: process.env, ...ctx });
    },
  });
}

export class InputError extends Error {
  constructor(msg) { super(msg); this.name = 'InputError'; }
}
