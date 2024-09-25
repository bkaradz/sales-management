import type { ExchangeRate, ExchangeRateDetails, Pricelist, PricelistDetails } from "$lib/server/drizzle/schema/schema"
import sortBy from "lodash-es/sortBy"
import type { EmbroideryTypeUnion, currencyTypeUnion } from "./lists.utility"

export type ExchangeRateCombinedArray = { exchangeRates: ExchangeRate, exchangeRateDetails: ExchangeRateDetails[] }

export const exchangeRateToMapObj = (list: ExchangeRateCombinedArray) => {
  const exchangeRateDetails = new Map<currencyTypeUnion, ExchangeRateDetails>()

  list.exchangeRateDetails.forEach((item) => {

    if (exchangeRateDetails.has(item.currency)) {
      exchangeRateDetails.set(item.currency, item)
    } else {
      exchangeRateDetails.set(item.currency, item)
    }
  })

  return {
    exchangeRates: { ...list.exchangeRates },
    exchangeRateDetails: exchangeRateDetails
  }
}

export type ExchangeRateToMap = ReturnType<typeof exchangeRateToMapObj>

export const pricelistToMapObj = (list: { pricelist: Pricelist, pricelist_details: PricelistDetails[] }) => {

  const pricelist_details = new Map<EmbroideryTypeUnion, PricelistDetails[]>()

  list.pricelist_details.forEach((item) => {

    if (pricelist_details.has(item.embroideryTypes)) {
      const tempItem = pricelist_details.get(item.embroideryTypes) || []
      pricelist_details.set(item.embroideryTypes, [...tempItem, item])
    } else {
      pricelist_details.set(item.embroideryTypes, [item])
    }
  })

  pricelist_details.forEach((value, key) => {
    const sortedArray = sortBy(value, ['minimumQuantity']);
    pricelist_details.set(key, sortedArray)
  });

  return {
    pricelist: { ...list.pricelist },
    pricelist_details: pricelist_details
  }
}

export type PricelistToMap = ReturnType<typeof pricelistToMapObj>