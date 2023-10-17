import { dinero, convert, type Dinero, type Rates, type Currency } from 'dinero.js';
import { USD, BWP, ZAR, } from '@dinero.js/currencies';

const currencyMap = new Map([
  ["USD", { code: 'USD', base: 10, exponent: 2 }],
  ["BWP", { code: 'BWP', base: 10, exponent: 2 }],
  ["ZAR", { code: 'ZAR', base: 10, exponent: 2 }],
  ["ZWR", { code: 'ZWR', base: 10, exponent: 2 }],
  ["ZWB", { code: 'ZWB', base: 10, exponent: 2 }],
])


export function converter(dineroObject: Dinero<number>, newCurrency: string) {

  const rate: Rates<number> = { 'ZAR': { amount: 89, scale: 2 } } // To map of rates

  let currency = currencyMap.get(newCurrency) // To map of currencies

  if (!currency) throw new Error("Currency type not found");

  return convert(dineroObject, currency, rate);

}

// const converter = createConverter(rates);

// converter(d, "EUR"); // a Dinero object with amount 44500 and scale 4