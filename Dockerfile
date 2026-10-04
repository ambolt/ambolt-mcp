# Local MCP server (stdio). Five tools are implemented in this repository; the bridge in bin/ambolt-mcp.mjs reaches the other tools on the hosted server.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY bin ./bin
COPY src ./src
COPY functions ./functions
USER node
ENTRYPOINT ["node", "bin/ambolt-local.mjs"]
