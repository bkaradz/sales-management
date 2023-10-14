import type { Pricelist, Products } from "$lib/server/drizzle/schema"
import { dinero, multiply, maximum, add } from "dinero.js";
import type { DineroSnapshot, Dinero } from "dinero.js";
import { USD } from '@dinero.js/currencies';

export const dollars = (amount: number) => dinero({ amount, currency: USD, scale: 3 });
export const addMany = (addends: Dinero<number>[]) => addends.reduce(add);
/**
 * input products
 * calculate using pricelist(Function)
 * convert using exchange rates(function)
 */

/**
 * Function to get pricelist for a given Quantity and Embroidery Type
 */

type key = 'flat' | 'cap' | 'applique' | 'nameTag'

export type PricelistDetailsMap = Map<key, {
  id: number;
  minimum_price: DineroSnapshot<number>;
  price_per_thousand_stitches: DineroSnapshot<number>;
  minimum_quantity: number;
  embroidery_types: string;
  pricelist_id: number;
}[]>

export type pricelistCombined = { pricelist: Pricelist, pricelist_details: PricelistDetailsMap }

export const getPricelist = (pricelist: pricelistCombined, quantity: number, embType: key) => {
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


// check that the product_category is embroidery first
// Should return date, product_id, pricelist_id, stitches, quantity, unit_price, total_price

export const calcPrice = (product: Products, pricelist: pricelistCombined, quantity: number, embType: key) => {

  // TODO: Call a function that calculate non embroidery products
  if (!(product.product_category === "embroidery")) throw new Error("Embroidery product needed");

  // Get pricelist
  const pricelistCalc = getPricelist(pricelist, quantity, embType)

  if (!product.stitches) throw new Error("Stitches not found");

  // Calculate price per 1000 stitches
  const unitPricePerThousand = multiply(dinero(pricelistCalc.price_per_thousand_stitches), { amount: product.stitches, scale: 3 })

  const unit_price = maximum([unitPricePerThousand, dinero(pricelistCalc.minimum_price)])

  const total_price = multiply(unit_price, quantity)

  return {
    total_price,
    unit_price,
    quantity,
    stitches: product.stitches,
    pricelist_id: pricelist.pricelist.id,
    product_id: product.id
  }

}