#!/usr/bin/env node
// Ambolt local MCP server (stdio, newline-delimited JSON-RPC). Implements five tools in this repository that need no Ambolt account or hosted service:
// iban_validate, dns_lookup, disposable_email_check, fx_rate_ecb, package_vulnerabilities. The other tools are reached through bin/ambolt-mcp.mjs (bridge to the hosted server).
import { createInterface } from 'node:readline';
import { loadFunctions } from '../src/registry.js';
import { createMcpHandler } from '../src/adapters/mcp.js';

const handle = createMcpHandler(await loadFunctions(), { name: 'ambolt-local', version: '0.2.0' });
const rl = createInterface({ input: process.stdin });
const pending = new Set();
rl.on('line', line => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  const job = handle(msg).then(res => { if (res) process.stdout.write(JSON.stringify(res) + '\n'); }).finally(() => pending.delete(job));
  pending.add(job);
});
rl.on('close', async () => { await Promise.allSettled([...pending]); process.exit(0); });
