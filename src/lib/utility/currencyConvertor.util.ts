import type { ExchangeRate, ExchangeRateDetails } from '$lib/server/drizzle/schema/schema';
import currency from 'currency.js';
import type { currencyTypeUnion } from './lists.utility';
import type { ExchangeRateToMap } from './monetary.util';


export function converter(currencyObject: currency | string | undefined, newCurrency: currencyTypeUnion, newRate: ExchangeRateToMap) {

  if (!currencyObject) throw new Error("Currency Object required");
  
  const exchange_rate_details = newRate.exchange_rate_details.get(newCurrency)

  if (!exchange_rate_details) throw new Error("Exchange Rate not found");

  return currency(currencyObject).multiply(exchange_rate_details.rate);

}

