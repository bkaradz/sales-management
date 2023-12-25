import { db } from "$lib/server/drizzle/client";
import { contacts, orders_details, payments, payments_details, shop_orders, transactions, transactions_details, type Orders } from "$lib/server/drizzle/schema/schema";
import type { Context } from "$lib/trpc/context";
import { addMany } from "$lib/utility/calculateCart.util";
import type { SavePayment } from "$lib/validation/payment.zod";
import { error } from "@sveltejs/kit";
import currency from "currency.js";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { gt, sortBy } from "lodash-es";


export const makePayment = async (input: SavePayment, ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
  }

  try {

    await db.transaction(async (tx) => {

      // arrange orders from smallest to highest amount and drop the ones that do not fit the amount paid
      const paymentOrdersDetails = await tx.select().from(orders_details).where(inArray(orders_details.shop_orders_id, input.selected_orders_ids));
      let paymentShopOrders = await tx.select().from(shop_orders).where(inArray(shop_orders.id, input.selected_orders_ids));
      const totalPaidAmount = addMany(input.payments_details.map((item) => item.default_currency_equivalent))
      // check that the paid balance is equivalent to the orders balance
      const totalOrdersAmount = addMany(paymentOrdersDetails.map((item) => currency(item.unit_price).multiply(item.quantity)))
      const paidMore = currency(totalPaidAmount).dollars() < currency(totalOrdersAmount).dollars()


      const sortedOrders = sortBy(paymentShopOrders, ['sales_amount'])

      
      if (paidMore) {
        const sortedPaymentShopOrders = []
        
        let accumulator = '0'
  
        while (gt(+currency(totalPaidAmount).dollars(), +currency(accumulator).dollars())) {
  
          const firstElement = sortedOrders.shift()
  
          if (!firstElement) throw new Error("Order Element not found");
  
          accumulator = currency(accumulator).add(firstElement.sales_amount).toString()
  
          sortedPaymentShopOrders.push(firstElement)
  
        }
        sortedPaymentShopOrders.pop()
        paymentShopOrders = sortedPaymentShopOrders
        const newSelectedOrdersIds = sortedPaymentShopOrders.map((item) => item.id)
        input.selected_orders_ids = newSelectedOrdersIds
      }

      const paymentShopOrdersMap = new Map<number, Orders>()
      paymentShopOrders.forEach((values) => paymentShopOrdersMap.set(values.id, values))

      const paymentTransactions = await tx.select().from(transactions).where(inArray(transactions.shop_orders_id, input.selected_orders_ids));

      // Write transactions to database
      // create payments for the orders
      const paymentId = await tx.insert(payments).values({
        user_id: ctx.session.user.userId,
        customer_id: input.customer_id,
        exchange_rate_id: input.exchange_rate_id,
        default_currency_equivalent_total: input.selected_orders_total,
      }).returning({ id: payments.id })

      await tx.transaction(async (tx2) => {
        input.payments_details.forEach(async (values) => {
          await tx2.insert(payments_details).values({ ...values, payments_id: paymentId[0].id, user_id: ctx.session.user.userId })
        })
      });


      // create transactions_details for the orders

      await tx.transaction(async (tx2) => {
        paymentTransactions.forEach(async (values) => {

          const currentOrder = paymentShopOrdersMap.get(values.shop_orders_id)
          if (!currentOrder) throw new Error("Transaction Shop Order not found");

          await tx2.insert(transactions_details).values({
            user_id: ctx.session.user.userId,
            transactions_id: values.id,
            payments_id: paymentId[0].id,
            amount_paid: currentOrder.sales_amount,
            fully_paid: true,
            active: true,
          })
        })
      });


      // update orders to paid

      await tx.transaction(async (tx2) => {
        paymentShopOrders.forEach(async (values) => {

          await tx2.update(shop_orders).set({
            payment_status: 'Paid',
            sales_status: 'Receipt',
          }).where(eq(shop_orders.id, values.id))
        })
      });

      // Update contact amount

      const orderTotals = await tx.select({
        orders_totals: sql<string>`COALESCE(sum(${shop_orders.sales_amount}), '0')`
      }).from(shop_orders).where(
        and(eq(shop_orders.customer_id, input.customer_id),
          and(ne(shop_orders.sales_status, 'Quotation'), ne(shop_orders.sales_status, 'Cancelled'))
        ))

      const totalSalesPaid = await tx.select({
        total_receipts: sql<string>`COALESCE(sum(${payments.default_currency_equivalent_total}), '0')`
      }).from(payments).where(eq(payments.customer_id, input.customer_id))

      const amount = currency(totalSalesPaid[0].total_receipts).subtract(orderTotals[0].orders_totals).toString()

      await tx.update(contacts).set({
        amount,
        orders_totals: orderTotals[0].orders_totals,
        total_receipts: totalSalesPaid[0].total_receipts
      }).where(eq(contacts.id, input.customer_id))

    });

  } catch (error) {
    console.error("🚀 ~ file: payments.drizzle.ts:129 ~ makePayment ~ error:", error)
  }

  return { success: true }
}