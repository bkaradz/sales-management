import { db } from "$lib/server/drizzle/client";
import { pricelist, pricelist_details, type Pricelist, type PricelistDetails } from "$lib/server/drizzle/schema";
import type { Context } from "$lib/trpc/context";
import { pricelistToMapObj } from "$lib/utility/monetary.util";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const getDefaultPricelists = async () => {

  try {

    const pricelistResults = await db.select({
      pricelist,
      pricelist_details
    }).from(pricelist)
      .leftJoin(pricelist_details, eq(pricelist_details.pricelist_id, pricelist.id))
      .where(eq(pricelist.default, true))

    const result = pricelistResults.reduce<Record<number, { pricelist: Pricelist; pricelist_details: PricelistDetails[]; }>>(
      (acc, row) => {
        const pricelist = row.pricelist;
        const pricelist_details = row.pricelist_details;


        if (!acc[pricelist.id]) acc[pricelist.id] = { pricelist, pricelist_details: [] };

        if (pricelist_details) acc[pricelist.id].pricelist_details.push(pricelist_details);

        return acc;
      }, {},
    );

    const pricelistId = pricelistResults[0].pricelist.id

    const pricelistMap = pricelistToMapObj(result[pricelistId])

    return pricelistMap

  } catch (error) {

  }
}

export const getAllPricelists = async (ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    const pricelistResults = await db.select({
      pricelist,
      pricelist_details
    }).from(pricelist)
      .leftJoin(pricelist_details, eq(pricelist_details.pricelist_id, pricelist.id))
      .where(eq(pricelist.active, true))

    const result = pricelistResults.reduce<Record<number, { pricelist: Pricelist; pricelist_details: PricelistDetails[]; }>>(
      (acc, row) => {
        const pricelist = row.pricelist;
        const pricelist_details = row.pricelist_details;


        if (!acc[pricelist.id]) acc[pricelist.id] = { pricelist, pricelist_details: [] };

        if (pricelist_details) acc[pricelist.id].pricelist_details.push(pricelist_details);

        return acc;
      }, {},
    );

    return Object.values(result)
    // return result

  } catch (error) {

  }
}

export const getById = async (input: number, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    const pricelistResults = await db.select({
      pricelist,
      pricelist_details
    }).from(pricelist)
      .leftJoin(pricelist_details, eq(pricelist_details.pricelist_id, pricelist.id))
      .where(eq(pricelist.id, input))

      const result = pricelistResults.reduce<Record<number, { pricelist: Pricelist; pricelist_details: PricelistDetails[]; }>>(
        (acc, row) => {
          const pricelist = row.pricelist;
          const pricelist_details = row.pricelist_details;
  
  
          if (!acc[pricelist.id]) acc[pricelist.id] = { pricelist, pricelist_details: [] };
  
          if (pricelist_details) acc[pricelist.id].pricelist_details.push(pricelist_details);
  
          return acc;
        }, {},
      );

    return result[input]

  } catch (error) {

  }
}

export const deleteById = async (input: number, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    await db.update(pricelist)
      .set({ active: false })
      .where(eq(pricelist.id, input));

    return {
      message: "success",
    }

  } catch (error) {

  }
}

export const createPricelist = async (input: any, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    const defaultPricelist = input?.default == 'on' ? true : false

    const descriptionPricelist = input?.description || null

    const pricelistResult = await db.insert(pricelist).values({ user_id: ctx.session.user.userId, name: input.name, default: defaultPricelist, description: descriptionPricelist }).returning({ id: pricelist.id });

    input.pricelist_details.forEach(async (item: any) => {
      await db.insert(pricelist_details).values({ pricelist_id: pricelistResult[0].id, ...item })
    })

    return { success: true }

  } catch (error) {
    console.error("🚀 ~ file: contacts.drizzle.ts:143 ~ createContact ~ error:", error)
  }

};