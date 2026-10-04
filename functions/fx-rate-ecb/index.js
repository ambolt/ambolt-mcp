import { defineFunction, InputError } from '../../src/core/define.js';

export default defineFunction({
  id: 'fx-rate-ecb',
  title: 'ECB Exchange Rates: Latest and Historical Reference Rates',
  description: 'European Central Bank euro foreign-exchange reference rates for any date since 1999, converted to any base currency. Reference rates published around 16:00 CET on working days; not tradable quotes.',
  keywords: ['exchange rate', 'ECB', 'EUR', 'DKK', 'USD', 'currency conversion', 'reference rate', 'valuta'],
  input: {
    type: 'object', additionalProperties: false,
    properties: {
      base: { type: 'string', pattern: '^[A-Za-z]{3}$', default: 'EUR', description: 'Base currency, ISO 4217.' },
      symbols: { type: 'array', maxItems: 40, items: { type: 'string', pattern: '^[A-Za-z]{3}$' }, description: 'Target currencies. Default: all.' },
      date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'YYYY-MM-DD. Default: latest. Weekends and holidays return the previous working day.' },
      amount: { type: 'number', minimum: 0, maximum: 1e12, default: 1, description: 'Amount of base currency to convert.' },
    },
  },
  price: { usd: 0.002, apifyEvent: 'rate' },
  sample: { base: 'EUR', symbols: ['DKK', 'USD'] },
  healthCheck: out => out.rates.DKK > 7 && out.rates.DKK < 8,
  async handler({ base, symbols, date, amount }, { fetch, now }) {
    const qs = new URLSearchParams({ base: base.toUpperCase() });
    if (symbols?.length) qs.set('symbols', symbols.map(s => s.toUpperCase()).join(','));
    if (amount !== 1) qs.set('amount', String(amount));
    const res = await fetch(`https://api.frankfurter.dev/v1/${date ?? 'latest'}?${qs}`);
    if (res.status === 404 || res.status === 422) throw new InputError('unknown currency or date');
    if (!res.ok) throw new Error(`upstream source returned HTTP ${res.status}`);
    const j = await res.json();
    return { base: j.base, amount: j.amount, date: j.date, rates: j.rates, source: 'Source: European Central Bank euro foreign exchange reference rates, via frankfurter.dev.', fetchedAt: now().toISOString() };
  },
});
