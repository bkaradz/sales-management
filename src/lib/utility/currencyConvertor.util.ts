import currency from 'currency.js';
import type { currencyTypeUnion } from './lists.utility';
import type { ExchangeRateToMap } from './monetary.util';
import fx from 'money';

export const convertFx = (amount: string | currency | undefined, exchange_rate: ExchangeRateToMap, to: currencyTypeUnion, from: currencyTypeUnion= 'USD') => {

  if (!amount) throw new Error("Currency Object required");

  if (!exchange_rate.exchange_rate_details) throw new Error("Exchange Rate not found");

  let rates = {};

  exchange_rate.exchange_rate_details.forEach((value, key) => {
		rates = { ...rates, [key]: value.rate };
	});

	fx.base = 'USD';
	fx.rates = rates;

  fx.settings = { from: 'USD', to: 'ZAR' };

  return fx.convert(amount.toString(), { from, to }).toString();
  
}