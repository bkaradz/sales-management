import { db } from "$lib/server/drizzle/client";
import { contacts, orders_details, shop_orders, transactions } from "$lib/server/drizzle/schema/schema";
import type { Context } from "$lib/trpc/context";
import { addMany } from "$lib/utility/calculateCart.util";
import type { SavePayment } from "$lib/validation/payment.zod";
import { error } from "@sveltejs/kit";
import currency from "currency.js";
import { eq, inArray } from "drizzle-orm";


export const makePayment = async (input: SavePayment, ctx: Context) => {
  console.log("🚀 ~ file: payments.drizzle.ts:9 ~ makePayment ~ input:", input)

  if (!ctx.session.sessionId) {
		error(404, 'User not found');
	}

  try {

    await db.transaction(async (tx) => {

      const paymentCustomer = await tx.select().from(contacts).where(eq(contacts.id, input.customer_id))
      const paymentShopOrders = await tx.select().from(shop_orders).where(inArray(shop_orders.id, input.selected_orders_ids));
      const paymentOrdersDetails = await tx.select().from(orders_details).where(inArray(orders_details.shop_orders_id, input.selected_orders_ids));
      const paymentTransactions = await tx.select().from(transactions).where(inArray(transactions.shop_orders_id, input.selected_orders_ids));

      // check that the paid balance is equivalent to the orders balance
      const totalPaidAmount = addMany(input.payments_details.map((item) => item.default_currency_equivalent))
      const totalOrdersAmount = addMany(paymentOrdersDetails.map((item) => currency(item.unit_price).multiply(item.quantity)))
      const paidMore = currency(totalPaidAmount).value >= currency(totalOrdersAmount).value
  
      // Write transactions to database
      if (paidMore) {
        // create payments for the orders

        // create transactions_details for the orders

        // update orders to paid

        // Update contact amount

      }

      if (!paidMore) {
        // arrange orders from smallest to highest amount and drop the ones that do not fit the amount paid

        // create payments details for the orders

        // create transactions_details for the orders that are enough for the money

        // update orders to paid

        // Update contact amount to add the balance
        
      }
  
      // await tx.update(accounts).set({ balance: sql`${accounts.balance} - 100.00` }).where(eq(users.name, 'Dan'));
      // await tx.update(accounts).set({ balance: sql`${accounts.balance} + 100.00` }).where(eq(users.name, 'Andrew'));
      // await tx.transaction(async (tx2) => {
      //   await tx2.update(users).set({ name: "Mr. Dan" }).where(eq(users.name, "Dan"));
      // });
    });
    
  } catch (error) {
    
  }

  


  return { success: true }
}