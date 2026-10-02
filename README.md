# Ambolt MCP server

Pay-per-call data and lookup tools for AI agents and developers, as an MCP server. Every result names its source and the time it was fetched.

- **MCP endpoint** (streamable HTTP, JSON-RPC): `https://api.ambolt.dev/mcp`
- **Website and docs**: https://ambolt.dev
- **Registry name**: `dev.ambolt/ambolt`

## Connect

```json
{ "mcpServers": { "ambolt": { "url": "https://api.ambolt.dev/mcp" } } }
```

Rate limit: 30 requests per minute per IP on the MCP route. For higher volume and a payment-secured API, use the HTTP endpoints with the x402 protocol (USDC on Base): see https://ambolt.dev.

## Tools (25)

| Tool | What it returns | Price per call over HTTP (x402) |
|---|---|---|
| `base_erc20_balance` | ERC-20 token balance of a wallet address on Base mainnet (USDC, WETH, any token): raw units, decimals, symbol and formatted amount, read live via eth_call.. | $0.003 |
| `base_token_info` | Basic facts about an ERC-20 token contract on Base mainnet: name, symbol, decimals and total supply (raw and formatted), read live via eth_call. | $0.003 |
| `crossref_doi` | Scholarly metadata from Crossref by DOI, or a best-match search by citation text: title, authors, journal, year, publisher, citation count, licence links and URL. | $0.003 |
| `disposable_email_check` | Fast email address check without sending anything: syntax, domain MX records, disposable/temporary-mail domain (9,000+ listed), role address (info@, admin@) and likely typo of a popular provider. | $0.003 |
| `dk_co2_intensity` | CO2 emissions per kWh of electricity consumed in Denmark (DK1 West, DK2 East), latest 5-minute value plus 24-hour average, cleanest and dirtiest times. | $0.005 |
| `dk_electricity_prices` | Day-ahead electricity spot prices for one day and bidding area, in EUR and DKK per MWh, quarter-hourly or hourly, with min/max/average and the cheapest hours. | $0.01 |
| `dns_lookup` | Resolve public DNS records for a domain (A, AAAA, MX, TXT, NS, CNAME) and report whether SPF and DMARC records are present, with their policies. | $0.003 |
| `domain_rdap` | Look up a domain in the public RDAP registry: registration, last-changed and expiry dates, status codes, nameservers, DNSSEC flag and registrar name. | $0.003 |
| `ecb_key_rates` | The three ECB key interest rates with their latest change dates and recent history, from the ECB Data Portal. | $0.003 |
| `ens_resolve` | Resolve an ENS name (e.g. | $0.003 |
| `eu_vat_validate` | Check whether an EU VAT number is valid and active in VIES, the European Commission VAT information exchange system. | $0.003 |
| `fx_rate_ecb` | European Central Bank euro foreign-exchange reference rates for any date since 1999, converted to any base currency, via Frankfurter. | $0.003 |
| `iban_validate` | Validate an IBAN offline: ISO 13616 checksum (mod 97), registered length for the country, and a normalised and grouped format. | $0.003 |
| `lei_lookup` | Look up a Legal Entity Identifier (LEI) record by 20-character LEI, or search legal entities by name and country. | $0.005 |
| `nordic_company_lookup` | Look up companies in the Norwegian (Brønnøysund) and Finnish (PRH/YTJ) company registers by registration number or name: name, legal form, industry, address, registration date and status. | $0.005 |
| `package_vulnerabilities` | Check an npm or PyPI package version against the OSV vulnerability database: advisory ids, aliases (CVE, GHSA), summary, severity label and first fixed version, plus the latest published version. | $0.003 |
| `solana_swap_quote` | Get a swap quote on Solana through a DEX aggregator: expected output, minimum output after slippage, price impact, route venues and all fees in basis points. | $0.003 |
| `solana_swap_transaction` | Build an unsigned Solana swap transaction through a DEX aggregator for a wallet you control. | $0.003 |
| `solana_token_facts` | Verifiable on-chain facts about a Solana token mint: whether the mint and freeze authorities are still set, total supply, decimals, token program, and how much of the supply the largest token accounts hold, plus public market metrics from a token index. | $0.01 |
| `solana_token_price` | Current USD price, 24-hour change, liquidity and decimals for up to 50 Solana token mints in one call, from an aggregated market feed. | $0.003 |
| `solana_token_search` | Find Solana tokens by symbol, name or mint address: mint, decimals, verification flag, organic score, liquidity, market cap and holder count. | $0.003 |
| `ted_notices_search` | Find recent EU public procurement notices from TED (Tenders Electronic Daily) by buyer country, CPV code, keyword and notice type. | $0.01 |
| `url_to_markdown` | Fetch a public web page and return its main text as Markdown with title, headings, lists, tables and absolute links. | $0.003 |
| `us_treasury_rates` | Monthly average interest rates on US Treasury marketable securities (bills, notes, bonds, TIPS, FRNs) from the US Treasury Fiscal Data API. | $0.003 |
| `wikipedia_summary` | Lead-section summary of a Wikipedia article by title and language: plain-text extract, short description, canonical URL and last-edit time. | $0.003 |

Informational only, not financial, legal or tax advice. Crypto tools are read-only or produce unsigned transactions; no keys or funds are ever held. Terms: https://ambolt.dev/terms. Privacy: https://ambolt.dev/privacy.

## License

The documentation in this repository is MIT licensed. The service itself is operated by Ambolt.
