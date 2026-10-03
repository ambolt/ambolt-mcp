#!/usr/bin/env node
// Ambolt MCP bridge: connects stdio-only MCP clients to the hosted Ambolt MCP server (https://api.ambolt.dev/mcp).
// Reads newline-delimited JSON-RPC from stdin, forwards each message over HTTPS and writes the answer to stdout. No dependencies, Node 18+.
// Free to use (30 requests a minute per IP). Set AMBOLT_MCP_URL to point at another endpoint.
import { createInterface } from 'node:readline';

const URL_ = process.env.AMBOLT_MCP_URL || 'https://api.ambolt.dev/mcp';
let session = null;

const parseBody = async res => {
  const type = res.headers.get('content-type') || '';
  const text = await res.text();
  if (type.includes('text/event-stream')) {
    return text.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trim()).filter(Boolean).map(l => JSON.parse(l));
  }
  return text.trim() ? [JSON.parse(text)] : [];
};

async function forward(msg) {
  const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'user-agent': 'ambolt-mcp-bridge/0.1' };
  if (session) headers['mcp-session-id'] = session;
  const res = await fetch(URL_, { method: 'POST', headers, body: JSON.stringify(msg), signal: AbortSignal.timeout(60_000) });
  session = res.headers.get('mcp-session-id') || session;
  if (res.status === 202 || res.status === 204) return [];
  return parseBody(res);
}

const rl = createInterface({ input: process.stdin });
const pending = new Set();
rl.on('line', line => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  const job = forward(msg).then(out => { for (const o of out) process.stdout.write(JSON.stringify(o) + '\n'); }, e => {
    if (msg.id !== undefined) process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, error: { code: -32000, message: `Ambolt MCP server unreachable: ${e.message}` } }) + '\n');
  }).finally(() => pending.delete(job));
  pending.add(job);
});
rl.on('close', async () => { await Promise.allSettled([...pending]); process.exit(0); });
