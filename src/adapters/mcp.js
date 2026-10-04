// Transport-agnostic MCP (JSON-RPC 2.0) handler exposing every factory function as a tool.
const VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

export function mcpTools(fns, { hideGeoblocked = false } = {}) {
  return fns.filter(f => f.channels.includes('mcp') && !(hideGeoblocked && f.geoblock)).map(f => ({
    name: f.mcpName,
    description: f.description,
    inputSchema: f.input,
    annotations: { readOnlyHint: true, openWorldHint: true },
  }));
}

export function createMcpHandler(fns, { name = 'factory', version = '0.1.0', ctx = {} } = {}) {
  const byName = new Map(fns.filter(f => f.channels.includes('mcp')).map(f => [f.mcpName, f]));
  // Returns a response object, or null for notifications.
  return async function handle(msg, req = {}) {
    if (msg.id === undefined) return null; // notification
    const ok = result => ({ jsonrpc: '2.0', id: msg.id, result });
    const bad = (code, message) => ({ jsonrpc: '2.0', id: msg.id, error: { code, message } });
    switch (msg.method) {
      case 'initialize': {
        const want = msg.params?.protocolVersion;
        return ok({
          protocolVersion: VERSIONS.includes(want) ? want : VERSIONS[0],
          capabilities: { tools: {} },
          serverInfo: { name, version },
        });
      }
      case 'ping': return ok({});
      case 'tools/list': return ok({ tools: mcpTools(fns, { hideGeoblocked: !!req.blocked }) }); // blocked regions never see geoblocked tools
      case 'tools/call': {
        const f = byName.get(msg.params?.name);
        if (!f) return bad(-32602, `unknown tool ${msg.params?.name}`);
        if (f.geoblock && req.blocked) return ok({ isError: true, content: [{ type: 'text', text: 'This tool is not available in your jurisdiction.' }] });
        try {
          const out = await f.run(msg.params?.arguments ?? {}, ctx);
          return ok({ content: [{ type: 'text', text: JSON.stringify(out) }], structuredContent: out });
        } catch (e) {
          return ok({ isError: true, content: [{ type: 'text', text: e.name === 'InputError' ? e.message : 'tool failed upstream' }] });
        }
      }
      default: return bad(-32601, `method not found: ${msg.method}`);
    }
  };
}
