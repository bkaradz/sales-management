import type { ExchangeRate, ExchangeRateDetails } from '$lib/server/drizzle/schema';
import { convert, type Dinero } from 'dinero.js';


export function converter(dineroObject: Dinero<number> | undefined, newCurrency: string, newRate: { exchange_rates: ExchangeRate, exchange_rate_details: Map<string, ExchangeRateDetails> }) {

  if (!dineroObject) throw new Error("Dinero Object required");
  
  const exchange_rate_details = newRate.exchange_rate_details.get(newCurrency)

  if (!exchange_rate_details) throw new Error("Exchange Rate not found");

  return convert(dineroObject, exchange_rate_details.currency_object, exchange_rate_details.rate);

}