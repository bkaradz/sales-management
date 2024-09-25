import type { Products } from "$lib/server/drizzle/schema/schema"
import type { PricelistToMap } from "./monetary.util";
import type { EmbroideryTypeUnion, currencyTypeUnion } from "./lists.utility";
import type { CartTypes } from "$lib/stores/cartStore";
import currency  from "currency.js";
import { max } from "lodash-es";


export const addMany = (addends: (currency | string )[]) => {
  let accumulator = 0 as unknown as currency
  addends.forEach((value) => accumulator = currency(accumulator).add(value))
  return accumulator.toString()
};

export const subtractMany = (subtrahends: (currency | string )[]) => {
  let accumulator = subtrahends.shift()
  if (!accumulator) throw new Error("Array is empty")
  subtrahends.forEach((value) => accumulator = (currency(accumulator as string).subtract(value)).toString())
  return accumulator.toString()
};

/**
 * input products
 * calculate using pricelist(Function)
 * convert using exchange rates(function)
 */

/**
 * Function to get pricelist for a given Quantity and Embroidery Type
 */

export const getPricelist = (pricelist: PricelistToMap, quantity: number, embroideryType: EmbroideryTypeUnion) => {
  if (!pricelist) throw new Error("Pricelist is required");
  if (!quantity) throw new Error("Quantity is required");
  if (!embroideryType) throw new Error("Embroidery Type is required");
  if (!pricelist.pricelist_details) throw new Error("Pricelist Details is required");

  // Get all major emb type
  const majorPricelist = pricelist.pricelist_details.get(embroideryType)

  if (!majorPricelist) throw new Error("Embroidery Type not found");

  const results = majorPricelist.find((list) => list.minimumQuantity >= quantity)

  if (!results) throw new Error("Pricelist was not found");

  return results

}

// check that the productCategory is Embroidery first
// Should return date, productId, pricelistId, stitches, quantity, unitPrice, total_price

export const calcProductPrices = (product: Products, pricelist: PricelistToMap, quantity: number, embroideryType: EmbroideryTypeUnion = 'Flat') => {

  if (!embroideryType) {
    embroideryType = 'Flat'
  }

  if (!quantity) throw new Error("Quantity not found");


  if (!product) throw new Error("product not found");


  if (product.productCategory !== 'Embroidery') {
    const unitPrice = product.productUnitPrice
    if (!unitPrice) throw new Error("Unit price not found");
    return unitPrice
  }

  // Get pricelist
  const pricelistCalc = getPricelist(pricelist, quantity, embroideryType)

  if (!product.stitches) throw new Error("Stitches not found");

  // Calculate price per 1000 stitches
  const unitPricePerThousand = currency(pricelistCalc.pricePerThousandStitches).multiply(product.stitches)

  let unitPrice = max([unitPricePerThousand, currency(pricelistCalc.minimumPrice).value])

  if (!unitPrice) throw new Error("Unit price not found");

  return unitPrice.toString()

}

export const calcPrice = (values: CartTypes, pricelist: PricelistToMap) => {

  let embroideryType = values.orders_details.embroideryType

  if (!embroideryType) {
    embroideryType = 'Flat'
  }

  let quantity = values.orders_details.quantity

  if (!quantity) throw new Error("Quantity not found");

  let product = values.product

  if (!product) throw new Error("product not found");


  if (!values.orders_details.priceCalculated) {
    return calcNonEmbroidery(values)
  }

  // Get pricelist
  const pricelistCalc = getPricelist(pricelist, quantity, embroideryType)

  if (!product.stitches) throw new Error("Stitches not found");

  // Calculate price per 1000 stitches
  const unitPricePerThousand = currency(pricelistCalc.pricePerThousandStitches).multiply((product.stitches / 1000))

  const unitPrice = max([unitPricePerThousand, currency(pricelistCalc.minimumPrice).value])

  if (!unitPrice) throw new Error("Unit price not found");

  const total_price = currency(unitPrice).multiply(quantity) as currency | string

  return {
    total_price,
    unitPrice,
    quantity,
    productId: product.id,
    productCategory: product.productCategory,

    embroideryType: values.orders_details.embroideryType,
    garmentPlacement: values.orders_details.garmentPlacement,
    stitches: product.stitches,
    pricelistId: pricelist.pricelist.id,
  }

}

export type CalcPriceReturn = ReturnType<typeof calcPrice>

const calcNonEmbroidery = (values: CartTypes) => {

  const unitPrice = values.orders_details.unitPrice

  if (!unitPrice) throw new Error("Unit price not found");

  const quantity = values.orders_details.quantity

  if (!quantity) throw new Error("quantity not found");

  // const unitPrice = unitPrice

  const total_price = currency(unitPrice).multiply(quantity)

  return {
    total_price,
    unitPrice,
    quantity,
    productId: values.orders_details.productId,
    productCategory: values.orders_details.productCategory,
  }
}


export const format = ((value: any, toCurrency: currencyTypeUnion) => {
  switch (toCurrency) {
    case 'ZAR':
      return currency(value, { symbol: "R", separator: " ", decimal: "." }).format();
    case 'BWP':
      return currency(value, { symbol: "P", separator: " ", decimal: "." }).format();
    case 'ZWB':
      return currency(value, { symbol: "ZB$", separator: " ", decimal: "." }).format();
    case 'ZWR':
      return currency(value, { symbol: "ZR$", separator: " ", decimal: "." }).format();
    default:
      return currency(value, { symbol: "$", separator: " ", decimal: "." }).format();
  }
})
