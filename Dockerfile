# stdio bridge to the hosted Ambolt MCP server (https://api.ambolt.dev/mcp). Starts instantly and answers introspection requests.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY bin ./bin
USER node
ENTRYPOINT ["node", "bin/ambolt-mcp.mjs"]
