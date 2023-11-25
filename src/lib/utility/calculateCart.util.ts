import type { Products } from "$lib/server/drizzle/schema"
import { dinero, multiply, maximum, add, toDecimal, subtract, toSnapshot } from "dinero.js";
import type { Dinero, Currency } from "dinero.js";
import type { PricelistToMap } from "./monetary.util";
import type { EmbroideryTypeUnion } from "./lists.utility";
import type { CartTypes } from "$lib/stores/cartStore";


export const dollars = (amount: number) => dinero({ amount, currency: { code: 'USD', base: 10, exponent: 2 }, scale: 3 });
export const addMany = (addends: Dinero<number>[]) => addends.reduce(add);
export const subtractMany = (subtrahends: Dinero<number>[]) => subtrahends.reduce(subtract);
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
    const unit_price = product.unit_price
    if (!unit_price) throw new Error("Unit price not found");
    return dinero(unit_price)
  }

  // Get pricelist
  const pricelistCalc = getPricelist(pricelist, quantity, embroideryType)

  if (!product.stitches) throw new Error("Stitches not found");

  // Calculate price per 1000 stitches
  const unitPricePerThousand = multiply(dinero(pricelistCalc.price_per_thousand_stitches), { amount: product.stitches, scale: 3 })

  const unit_price = maximum([unitPricePerThousand, dinero(pricelistCalc.minimum_price)])
  
  return  unit_price

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

  // if (values.orders_details.unit_price) {
  //   return calcNonEmbroidery(values)
  // }

  // Get pricelist
  const pricelistCalc = getPricelist(pricelist, quantity, embroideryType)

  if (!product.stitches) throw new Error("Stitches not found");

  // Calculate price per 1000 stitches
  const unitPricePerThousand = multiply(dinero(pricelistCalc.price_per_thousand_stitches), { amount: product.stitches, scale: 3 })

  const unit_price = maximum([unitPricePerThousand, dinero(pricelistCalc.minimum_price)])

  const total_price = multiply(unit_price, { amount: quantity * 1000, scale: 3 })

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

  const total_price = multiply(unit_price, { amount: (quantity * 1000), scale: 3 })

  return {
    total_price,
    unit_price,
    quantity,
    product_id: values.orders_details.product_id,
    product_category: values.orders_details.product_category,
  }
}



function createFormatter(transformer: any) {
  return function formatter(dineroObject: Dinero<number>) {
    return toDecimal(dineroObject, transformer)
  }
}

export const format = createFormatter(({ value, currency }: { value: string, currency: Currency<number> }) =>
  `${currency.code} ${Number(value).toFixed(2)}`
)

// function toSnapshot(unitPricePerThousand: Dinero<number>): any {
//   throw new Error("Function not implemented.");
// }
