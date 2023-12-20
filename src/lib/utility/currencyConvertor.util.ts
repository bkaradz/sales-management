import currency from 'currency.js';
import type { currencyTypeUnion } from './lists.utility';
import type { ExchangeRateToMap } from './monetary.util';
import fx from 'money';

// TODO: REMOVE THIS FUNCTION
export function converter(amount: currency | string | undefined, newCurrency: currencyTypeUnion, newRate: ExchangeRateToMap) {

  if (!amount) throw new Error("Currency Object required");
  
  const exchange_rate_details = newRate.exchange_rate_details.get(newCurrency)

  if (!exchange_rate_details) throw new Error("Exchange Rate not found");

  return convertFx(amount, newRate, newCurrency);

}

export const convertFx = (amount: string | currency, exchange_rate: ExchangeRateToMap, to: currencyTypeUnion, from: currencyTypeUnion= 'USD') => {

  let rates = {};

  exchange_rate.exchange_rate_details.forEach((value, key) => {
		rates = { ...rates, [key]: value.rate };
	});

	fx.base = 'USD';
	fx.rates = rates;

  fx.settings = { from: 'USD', to: 'ZAR' };

  return fx.convert(amount.toString(), { from, to }).toString();
  
}