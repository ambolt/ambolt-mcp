# Ambolt MCP server

[![SSL expiry](https://ambolt.dev/badge/ssl/ambolt.dev.svg)](https://ambolt.dev/tools/badge-generator) [![Vulnerabilities](https://ambolt.dev/badge/vulns.svg?ecosystem=npm&name=%40ambolt%2Fmcp&version=0.2.0)](https://ambolt.dev/tools/badge-generator)

Pay-per-call data and lookup tools for AI agents and developers, as an MCP server. Every result names its source and the time it was fetched.

- **MCP endpoint** (streamable HTTP, JSON-RPC): `https://api.ambolt.dev/mcp`
- **Website and docs**: https://ambolt.dev
- **Registry name**: `dev.ambolt/ambolt`

## What is in this repository

- `bin/ambolt-local.mjs`: a complete MCP server (stdio) whose five tools run in this repository's code, with no Ambolt account or hosted service: `iban_validate` (offline), `disposable_email_check`, `dns_lookup`, `fx_rate_ecb` and `package_vulnerabilities`. Source in `functions/` and `src/`; run it with `npx -y -p @ambolt/mcp ambolt-local` or `node bin/ambolt-local.mjs`.
- `bin/ambolt-mcp.mjs`: the bridge to the hosted server with all 37 tools (see the table below). The hosted server's other tools (company registers, tenders, on-chain facts, Solana swap and so on) run on Ambolt's infrastructure and are not part of this repository.

## Connect

```json
{ "mcpServers": { "ambolt": { "url": "https://api.ambolt.dev/mcp" } } }
```

For clients that only speak stdio (Claude Desktop, many IDE agents), use the bridge package; it forwards to the same hosted server and needs no API key:

```json
{ "mcpServers": { "ambolt": { "command": "npx", "args": ["-y", "@ambolt/mcp"] } } }
```

Rate limit: 30 requests per minute per IP on the MCP route. For higher volume and a payment-secured API, use the HTTP endpoints with the x402 protocol (USDC on Base): see https://ambolt.dev.

## Tools (37)

| Tool | What it returns | Price per call over HTTP (x402) |
|---|---|---|
| `base_erc20_balance` | ERC-20 token balance of a wallet address on Base mainnet (USDC, WETH, any token): raw units, decimals, symbol and formatted amount, read live via eth_call. | $0.003 |
| `base_token_facts` | Verifiable on-chain facts about an ERC-20 token on Base: name, symbol, supply, whether the contract has an owner (and whether it was renounced), whether it is an upgradeable proxy and who administers it, whether it is paused, and which privileged functions (mint, burn, pause, blacklist, fee setting, upgrade) appear in its bytecode. | $0.01 |
| `base_token_info` | Basic facts about an ERC-20 token contract on Base mainnet: name, symbol, decimals and total supply (raw and formatted), read live via eth_call. | $0.003 |
| `base_transaction` | Look up a transaction on Base by hash: success or revert, block and time, sender, recipient, ETH value, gas and fee, the called method selector, and decoded ERC-20 transfers with token symbols. | $0.005 |
| `base_wallet_balances` | ETH balance and balances of major tokens (USDC, WETH, cbBTC, DAI, USDbC, cbETH, AERO) for any address on Base, plus any extra token contracts you list. | $0.005 |
| `disposable_email_check` | Fast email address check without sending anything: syntax, domain MX records, disposable/temporary-mail domain (9,000+ listed), role address (info@, admin@) and likely typo of a popular provider. | $0.003 |
| `dk_co2_intensity` | CO2 emissions per kWh of electricity consumed in Denmark (DK1 West, DK2 East), latest 5-minute value plus 24-hour average, cleanest and dirtiest times. | $0.005 |
| `dk_electricity_prices` | Day-ahead electricity spot prices for one day and bidding area, in EUR and DKK per MWh, quarter-hourly or hourly, with min/max/average and the cheapest hours. | $0.01 |
| `dns_lookup` | Resolve public DNS records for a domain (A, AAAA, MX, TXT, NS, CNAME) and report whether SPF and DMARC records are present, with their policies. | $0.003 |
| `doi_lookup` | Scholarly metadata by DOI, or a best-match search by citation text: title, authors, journal, year, publisher, citation count, licence links and URL. Bibliographic facts only. | $0.003 |
| `domain_rdap` | Look up a domain in the public RDAP registry: registration, last-changed and expiry dates, status codes, nameservers, DNSSEC flag and registrar name. | $0.003 |
| `domain_ssl_sweep` | Check SSL certificate and domain registration expiry for one domain or a whole list: certificate issuer, valid from and to, days left, trusted or not, domain registration and expiry dates, registrar and nameservers. | $0.005 |
| `ecb_key_rates` | The three ECB key interest rates with their latest change dates and recent history. | $0.003 |
| `ens_resolve` | Resolve an ENS name (e.g. | $0.003 |
| `entity_resolve` | Resolve a company name, website domain, registry number, LEI or VAT number to its official legal entity: registry, registry number, legal form, status, address, industry codes, size where published and LEI. Searches national registers (Norway, Finland, Czechia, Slovakia, France, UK; Poland by KRS number) and GLEIF, scores the match and links every record to its source. | $0.01 |
| `eu_vat_validate` | Check whether an EU VAT number is valid and active. | $0.003 |
| `fx_rate_ecb` | European Central Bank euro foreign-exchange reference rates for any date since 1999, converted to any base currency. | $0.003 |
| `iban_validate` | Validate an IBAN offline: ISO 13616 checksum (mod 97), registered length for the country, and a normalised and grouped format. | $0.003 |
| `lei_lookup` | Look up a Legal Entity Identifier (LEI) record by 20-character LEI, or search legal entities by name and country. | $0.005 |
| `nordic_company_lookup` | Look up companies in the Norwegian and Finnish company registers by registration number or name: name, legal form, industry, address, registration date and status. | $0.005 |
| `package_vulnerabilities` | Check an npm or PyPI package version against a public vulnerability database: advisory ids, aliases (CVE, GHSA), summary, severity label and first fixed version, plus the latest published version. | $0.003 |
| `rss_feed_normaliser` | Turn any RSS 2.0, RSS 1.0, Atom or JSON Feed into one clean JSON schema: feed title, link and language, then items with id, title, URL, ISO published/updated dates, summary, categories and enclosure. | $0.003 |
| `sitemap_robots_doctor` | Audit a website's robots.txt and XML sitemaps in one call: user-agent groups and blocked paths, sitemap declarations, whether each sitemap loads, URL counts (indexes followed to 10 files), lastmod coverage and age, duplicates, off-host and non-HTTPS URLs, size-limit breaches, and a sample of listed URLs checked for status. | $0.005 |
| `solana_swap_quote` | Get a swap quote on Solana through a DEX aggregator: expected output, minimum output after slippage, price impact, route venues and all fees in basis points. | free |
| `solana_swap_transaction` | Build an unsigned Solana swap transaction through a DEX aggregator for a wallet you control. | free |
| `solana_token_facts` | Verifiable on-chain facts about a Solana token mint: whether the mint and freeze authorities are still set, total supply, decimals, token program, and how much of the supply the largest token accounts hold, plus public market metrics from a token index. | $0.01 |
| `solana_token_price` | Current USD price, 24-hour change, liquidity and decimals for up to 50 Solana token mints in one call, from an aggregated market feed. | $0.003 |
| `solana_token_search` | Find Solana tokens by symbol, name or mint address: mint, decimals, verification flag, organic score, liquidity, market cap and holder count. | $0.003 |
| `solana_transaction` | Look up a confirmed Solana transaction by signature: success or error, time, fee, signers, programs used, and the resulting SOL and token balance changes per account. | $0.005 |
| `solana_wallet_balances` | SOL balance and token holdings of any Solana address, with symbols, USD prices and values, largest first. | $0.01 |
| `tech_stack_lookup` | Detect the technologies a public website uses: CMS or site builder, JavaScript framework, CDN and hosting, web server, analytics and tag managers, advertising pixels, support widgets, payments, consent tools. | $0.005 |
| `ted_notices_search` | Find recent EU public procurement notices by buyer country, CPV code, keyword and notice type. | $0.01 |
| `tender_feed` | Search public tenders across TED (EU), Find a Tender (UK) and SAM.gov (US) in one normalised schema: title, buyer organisation, country, CPV codes, deadline, estimated value, procurement method and source link. | $0.02 |
| `url_metadata` | Link-preview data for one or many public URLs: title, description, canonical URL, Open Graph and Twitter card fields, favicon, language, hreflang alternates, feed links and JSON-LD types. | $0.003 |
| `url_to_markdown` | Fetch a public web page and return its main text as Markdown with title, headings, lists, tables and absolute links. | $0.003 |
| `us_treasury_rates` | Monthly average interest rates on US Treasury marketable securities (bills, notes, bonds, TIPS, FRNs) Latest months first. | $0.003 |
| `wikipedia_summary` | Lead-section summary of a Wikipedia article by title and language: plain-text extract, short description, canonical URL and last-edit time. | $0.003 |

Informational only, not financial, legal or tax advice. Crypto tools are read-only or produce unsigned transactions; no keys or funds are ever held. Terms: https://ambolt.dev/terms. Privacy: https://ambolt.dev/privacy.

## License

The code and documentation in this repository are MIT licensed. The hosted service is operated by Ambolt.
