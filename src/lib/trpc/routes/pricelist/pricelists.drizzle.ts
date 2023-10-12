import { db } from "$lib/server/drizzle/client";
import { pricelist, pricelist_details } from "$lib/server/drizzle/schema";
import type { Context } from "$lib/trpc/context";
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

    return pricelistResults[0]

  } catch (error) {

  }
}

export const getAllPricelists = async () => {

  try {

    const pricelistResults = await db.select({
      pricelist,
      pricelist_details
    }).from(pricelist)
      .leftJoin(pricelist_details, eq(pricelist_details.pricelist_id, pricelist.id))
      .where(eq(pricelist.active, true))

    return pricelistResults

  } catch (error) {

  }
}

export const getById = async (input: number) => {

  try {

    const pricelistResults = await db.select({
      pricelist,
      pricelist_details
    }).from(pricelist)
      .leftJoin(pricelist_details, eq(pricelist_details.pricelist_id, pricelist.id))
      .where(eq(pricelist.id, input))

    return pricelistResults[0]

  } catch (error) {

  }
}

export const deleteById = async (input: number) => {

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