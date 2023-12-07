import type { ExchangeRate, ExchangeRateDetails, Pricelist, PricelistDetails } from "$lib/server/drizzle/schema/schema"
import sortBy from "lodash-es/sortBy"
import type { EmbroideryTypeUnion, currencyTypeUnion } from "./lists.utility"

export type ExchangeRateCombinedArray = { exchange_rates: ExchangeRate, exchange_rate_details: ExchangeRateDetails[] }

export const exchangeRateToMapObj = (list: ExchangeRateCombinedArray) => {
  const exchange_rate_details = new Map<currencyTypeUnion, ExchangeRateDetails>()

  list.exchange_rate_details.forEach((item) => {

    if (exchange_rate_details.has(item.currency)) {
      exchange_rate_details.set(item.currency, item)
    } else {
      exchange_rate_details.set(item.currency, item)
    }
  })

  return {
    exchange_rates: { ...list.exchange_rates },
    exchange_rate_details: exchange_rate_details
  }
}

export type ExchangeRateToMap = ReturnType<typeof exchangeRateToMapObj>

export const pricelistToMapObj = (list: { pricelist: Pricelist, pricelist_details: PricelistDetails[] }) => {

  const pricelist_details = new Map<EmbroideryTypeUnion, PricelistDetails[]>()

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
    pricelist: { ...list.pricelist },
    pricelist_details: pricelist_details
  }
}

export type PricelistToMap = ReturnType<typeof pricelistToMapObj>