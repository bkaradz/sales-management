import { dinero, add, type Dinero, toSnapshot } from 'dinero.js';
import { USD } from '@dinero.js/currencies';

export const dollars = (amount: number) => dinero({ amount, currency: USD, scale: 3 });
export const addMany = (addends: Dinero<number>[]) => addends.reduce(add);

const pricelists = new Map([
  [3, {quantity: 3, minimum_price: toSnapshot(dollars(1500)), price_per_thousand_stitches: toSnapshot(dollars(200)) }],
  [20, {quantity: 20, minimum_price: toSnapshot(dollars(1000)), price_per_thousand_stitches: toSnapshot(dollars(180)) }],
  [50, {quantity: 50, minimum_price: toSnapshot(dollars(1000)), price_per_thousand_stitches: toSnapshot(dollars(160)) }],
  [100, {quantity: 100, minimum_price: toSnapshot(dollars(950)), price_per_thousand_stitches: toSnapshot(dollars(150)) }],
  [10000, {quantity: 10000, minimum_price: toSnapshot(dollars(900)), price_per_thousand_stitches: toSnapshot(dollars(140)) }]
])


export const pricelistsObj = JSON.stringify(pricelists, replacer);

function replacer(key, value) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

export function reviver(key, value) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}