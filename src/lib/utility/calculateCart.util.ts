import type { Products } from "$lib/server/drizzle/schema"
import { dinero, multiply, maximum, add, toDecimal, subtract } from "dinero.js";
import type {  Dinero, Currency } from "dinero.js";
import { USD } from '@dinero.js/currencies';
import type { PricelistToMap } from "./monetary.util";

export const dollars = (amount: number) => dinero({ amount, currency: USD, scale: 3 });
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

export type ProductCategories = 'Embroidery' | 'Threads' | 'Needles' | 'Backing' | 'Prewound Bobbin' | 'Bobbin Case' | 'Golf Shirts' | 'Round Neck' | 'Work Suit' | 'Cap' | 'Other'
export type PaymentMethod = 'Rand' | 'USD' | 'Zim RTGS' | 'Zim Bond' | 'Swipe' | 'Banc ABC' | 'Stewart Bank'
export type ProductionStatus = 'Origination' | 'Awaiting Logo Approval' | 'Received' | 'Awaiting Embroidery' | 'Embroidery' | 'Awaiting Trimming'| 'Trimming' | 'Awaiting Collection' | 'Collected'
export type SalesStatus = 'Quotation' | 'Sales Order' | 'Invoice' | 'Receipt' | 'Cancelled'
export type PaymentStatus = 'Awaiting Payment' | 'Paid' | 'Cancelled' | 'Refunded' | 'Awaiting Sales Order'

export type GarmentPlacement = 'Front Left' | 'Front Right' | 'Upper Back' | 'Lower Back' | 'Right Sleeve' | 'Left Sleeve' | 'Cap Front' | 'Cap Right Side' | 'Cap Left Side' | 'Name Tag' | 'Marked Position'

export type EmbTypekey = 'Flat' | 'Cap' | 'Applique' | 'Name Tag'

export const getPricelist = (pricelist: PricelistToMap, quantity: number, embType: EmbTypekey) => {
  if (!pricelist) throw new Error("Pricelist is required");
  if (!quantity) throw new Error("Quantity is required");
  if (!embType) throw new Error("Embroidery Type is required");
  if (!pricelist.pricelist_details) throw new Error("Pricelist Details is required");

  // Get all major emb type
  const majorPricelist = pricelist.pricelist_details.get(embType)

  if (!majorPricelist) throw new Error("Embroidery Type not found");

  const results = majorPricelist.find((list) => list.minimum_quantity >= quantity)

  if (!results) throw new Error("Pricelist was not found");

  return results

}


// check that the product_category is Embroidery first
// Should return date, product_id, pricelist_id, stitches, quantity, unit_price, total_price

export const calcPrice = (product: Products, pricelist: PricelistToMap, quantity: number, embType: EmbTypekey = 'Flat') => {

  if (!embType) {
    embType = 'Flat'
  }

  if (!((product.product_category).toLowerCase() === 'Embroidery'.toLowerCase())) {
    return calcNonEmbroidery(product, quantity)
  }

  // Get pricelist
  const pricelistCalc = getPricelist(pricelist, quantity, embType)

  if (!product.stitches) throw new Error("Stitches not found");

  // Calculate price per 1000 stitches
  const unitPricePerThousand = multiply(dinero(pricelistCalc.price_per_thousand_stitches), { amount: product.stitches, scale: 3 })

  const unit_price = maximum([unitPricePerThousand, dinero(pricelistCalc.minimum_price)])

  const total_price = multiply(unit_price, { amount: quantity * 1000, scale: 3 } )

  return {
    total_price,
    unit_price,
    quantity,
    embroidery_type: product.embroidery_type,
    garment_placement: product.garment_placement,
    stitches: product.stitches,
    pricelist_id: pricelist.pricelist.id,
    product_id: product.id
  }

}

export type CalcPriceReturn = ReturnType<typeof calcPrice>

function createFormatter(transformer: any) {
  return function formatter(dineroObject: Dinero<number>) {
    return toDecimal(dineroObject, transformer)
  }
}

export const format = createFormatter(({ value, currency }: { value: string, currency: Currency<number> }) =>
  `${currency.code} ${Number(value).toFixed(2)}`
)

const calcNonEmbroidery = (product: Products, quantity: number) => {

  const unitPrice = product.unit_price

  if (!unitPrice) throw new Error("Unit price not found");
  
  const unit_price = dinero(unitPrice)

  const total_price = multiply(unit_price, { amount: (quantity * 1000), scale: 3 })

  return {
    total_price,
    unit_price,
    quantity,
    product_id: product.id
  }
}