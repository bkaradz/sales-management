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
  let accumulator = 0 as unknown as currency
  subtrahends.forEach((value) => accumulator = currency(accumulator).subtract(value))
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

  const results = majorPricelist.find((list) => list.minimum_quantity >= quantity)

  if (!results) throw new Error("Pricelist was not found");

  return results

}

// check that the product_category is Embroidery first
// Should return date, product_id, pricelist_id, stitches, quantity, unit_price, total_price

export const calcProductPrices = (product: Products, pricelist: PricelistToMap, quantity: number, embroideryType: EmbroideryTypeUnion = 'Flat') => {

  if (!embroideryType) {
    embroideryType = 'Flat'
  }

  if (!quantity) throw new Error("Quantity not found");


  if (!product) throw new Error("product not found");


  if (product.product_category !== 'Embroidery') {
    const unit_price = product.product_unit_price
    if (!unit_price) throw new Error("Unit price not found");
    return unit_price
  }

  // Get pricelist
  const pricelistCalc = getPricelist(pricelist, quantity, embroideryType)

  if (!product.stitches) throw new Error("Stitches not found");

  // Calculate price per 1000 stitches
  const unitPricePerThousand = currency(pricelistCalc.price_per_thousand_stitches).multiply(product.stitches)

  let unit_price = max([unitPricePerThousand, currency(pricelistCalc.minimum_price).value])

  if (!unit_price) throw new Error("Unit price not found");

  return unit_price.toString()

}

export const calcPrice = (values: CartTypes, pricelist: PricelistToMap) => {

  let embroideryType = values.orders_details.embroidery_type

  if (!embroideryType) {
    embroideryType = 'Flat'
  }

  let quantity = values.orders_details.quantity

  if (!quantity) throw new Error("Quantity not found");

  let product = values.product

  if (!product) throw new Error("product not found");


  if (!values.orders_details.price_calculated) {
    return calcNonEmbroidery(values)
  }

  // Get pricelist
  const pricelistCalc = getPricelist(pricelist, quantity, embroideryType)

  if (!product.stitches) throw new Error("Stitches not found");

  // Calculate price per 1000 stitches
  const unitPricePerThousand = currency(pricelistCalc.price_per_thousand_stitches).multiply((product.stitches / 1000))

  const unit_price = max([unitPricePerThousand, currency(pricelistCalc.minimum_price).value])

  if (!unit_price) throw new Error("Unit price not found");

  const total_price = currency(unit_price).multiply(quantity) as currency | string

  return {
    total_price,
    unit_price,
    quantity,
    product_id: product.id,
    product_category: product.product_category,

    embroidery_type: values.orders_details.embroidery_type,
    garment_placement: values.orders_details.garment_placement,
    stitches: product.stitches,
    pricelist_id: pricelist.pricelist.id,
  }

}

export type CalcPriceReturn = ReturnType<typeof calcPrice>

const calcNonEmbroidery = (values: CartTypes) => {

  const unit_price = values.orders_details.unit_price

  if (!unit_price) throw new Error("Unit price not found");

  const quantity = values.orders_details.quantity

  if (!quantity) throw new Error("quantity not found");

  // const unit_price = unitPrice

  const total_price = currency(unit_price).multiply(quantity)

  return {
    total_price,
    unit_price,
    quantity,
    product_id: values.orders_details.product_id,
    product_category: values.orders_details.product_category,
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
