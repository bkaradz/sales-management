import type { Pricelist, PricelistDetails, Products } from "$lib/server/drizzle/schema"
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
  minimum_price: JSON;
  price_per_thousand_stitches: JSON;
  minimum_quantity: number;
  embroidery_types: string;
  pricelist_id: number;
}[]>

export type pricelistCombined = { pricelist: Pricelist, pricelist_details: PricelistDetailsMap }

export const getPricelist = (pricelist: pricelistCombined , quantity: number, embType: key) => {
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

export const calcPrice = (product: Products, quantity: number, embType: string) => {
  
}