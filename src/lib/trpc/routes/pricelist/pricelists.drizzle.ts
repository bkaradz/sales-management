import { db } from "$lib/server/drizzle/client";
import { pricelist, pricelist_details } from "$lib/server/drizzle/schema";
import { getPagination } from "$lib/utility/pagination.util";
import type { SearchParams } from "$lib/validation/searchParams.validate";
import { eq } from "drizzle-orm";


export const getDefaultPricelists = async () => {

  try {
     const pricelistResults = await db.select().from(pricelist).where(eq(pricelist.default, true))
     const pricelistDetailsResults = await db.select().from(pricelist_details).where(eq(pricelist_details.pricelist_id, pricelistResults[0].id))

     return {
      pricelist: pricelistDetailsResults[0],
      pricelist_details: pricelistDetailsResults
     }

  } catch (error) {
    
  }
}