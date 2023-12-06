import type { ExchangeRate, ExchangeRateDetails } from '$lib/server/drizzle/schema/schema';
import currency from 'currency.js';
import type { currencyTypeUnion } from './lists.utility';


export function converter(currencyObject: currency | undefined, newCurrency: currencyTypeUnion, newRate: { exchange_rates: ExchangeRate, exchange_rate_details: Map<currencyTypeUnion, ExchangeRateDetails> }) {

  if (!currencyObject) throw new Error("Currency Object required");
  
  const exchange_rate_details = newRate.exchange_rate_details.get(newCurrency)

  if (!exchange_rate_details) throw new Error("Exchange Rate not found");

  return currency(currencyObject).multiply(exchange_rate_details.rate);

}

