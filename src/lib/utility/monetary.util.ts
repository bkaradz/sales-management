import type { ExchangeRate, ExchangeRateDetails, Pricelist, PricelistDetails } from "$lib/server/drizzle/schema"
import sortBy  from "lodash-es/sortBy"

export const exchangeRateToMapObj = (list: { exchange_rates: ExchangeRate, exchange_rate_details: ExchangeRateDetails[] }) => {
  const exchange_rate_details = new Map()

  list.exchange_rate_details.forEach((item) => {

    if (exchange_rate_details.has(item.currency)) {
      exchange_rate_details.set(item.currency, [...exchange_rate_details.get(item.currency), item])
    } else {
      exchange_rate_details.set(item.currency, [item])
    }
  })

  return {
    pricelist: {...list.exchange_rates},
    pricelist_details: exchange_rate_details
  }
}

export const pricelistToMapObj = (list: { pricelist: Pricelist, pricelist_details: PricelistDetails[] }) => {
  const pricelist_details = new Map<string, PricelistDetails[]>()

  list.pricelist_details.forEach((item) => {

    if (pricelist_details.has(item.embroidery_types)) {
      const tempItem = pricelist_details.get(item.embroidery_types) || []
      pricelist_details.set(item.embroidery_types, [...tempItem, item])
    } else {
      pricelist_details.set(item.embroidery_types, [item])
    }
  })

  pricelist_details.forEach((value, key) => {
    const sortedArray = sortBy(value, ['minimum_quantity']);
    pricelist_details.set(key, sortedArray)
  });

  return {
    pricelist: {...list.pricelist},
    pricelist_details: pricelist_details
  }
}