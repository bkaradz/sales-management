import { db } from "$lib/server/drizzle/client";
import { contacts, orders_details, shop_orders } from "$lib/server/drizzle/schema/schema";
import type { Context } from "$lib/trpc/context";
import type { savePayment } from "$lib/validation/payment.zod";
import { error } from "@sveltejs/kit";
import { eq, inArray } from "drizzle-orm";


export const makePayment = async (input: savePayment, ctx: Context) => {
  console.log("🚀 ~ file: payments.drizzle.ts:9 ~ makePayment ~ input:", input)

  if (!ctx.session.sessionId) {
		error(404, 'User not found');
	}

  await db.transaction(async (tx) => {

    const customer = tx.select().from(contacts).where(eq(contacts.id, input.customer_id))
    const transactionOrders = await db.select().from(shop_orders).where(inArray(shop_orders.id, input.selected_orders_ids));
    const transactionOrdersDetails = await db.select().from(orders_details).where(inArray(orders_details.shop_orders_id, input.selected_orders_ids));


    // await tx.update(accounts).set({ balance: sql`${accounts.balance} - 100.00` }).where(eq(users.name, 'Dan'));
    // await tx.update(accounts).set({ balance: sql`${accounts.balance} + 100.00` }).where(eq(users.name, 'Andrew'));
    // await tx.transaction(async (tx2) => {
    //   await tx2.update(users).set({ name: "Mr. Dan" }).where(eq(users.name, "Dan"));
    // });
  });


  return { success: true }
}