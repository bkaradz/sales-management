import { db } from "$lib/server/drizzle/client";
import { contacts, orders_details, payments, payments_details, shop_orders, transactions, transactions_details, type Orders } from "$lib/server/drizzle/schema/schema";
import type { Context } from "$lib/server/context";
import { addMany } from "$lib/utility/calculateCart.util";
import type { SavePayment } from "$lib/validation/payment.zod";
import { error } from "@sveltejs/kit";
import currency from "currency.js";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { gt, sortBy } from "lodash-es";


export const makePayment = async (input: SavePayment, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

    await db.transaction(async (tx) => {

      // arrange orders from smallest to highest amount and drop the ones that do not fit the amount paid
      const customers = await tx.select().from(contacts).where(eq(contacts.id, input.customerId))
      const paymentOrdersDetails = await tx.select().from(orders_details).where(inArray(orders_details.shopOrdersId, input.selected_orders_ids));
      let paymentShopOrders = await tx.select().from(shop_orders).where(inArray(shop_orders.id, input.selected_orders_ids));
      let totalPaidAmount = addMany(input.payments_details.map((item) => item.defaultCurrencyEquivalent))
      // check that the paid balance is equivalent to the orders balance
      const totalOrdersAmount = addMany(paymentOrdersDetails.map((item) => currency(item.unitPrice).multiply(item.quantity)))

      if (+customers[0].amount > 0) {
        totalPaidAmount = currency(customers[0].amount).add(totalPaidAmount).toString()
      }

      const paidMore = currency(totalPaidAmount).dollars() < currency(totalOrdersAmount).dollars()

      const sortedOrders = sortBy(paymentShopOrders, ['salesAmount'])

      if (paidMore) {
        const sortedPaymentShopOrders = []
        
        let accumulator = '0'
  
        while (gt(+currency(totalPaidAmount).dollars(), +currency(accumulator).dollars())) {
  
          const firstElement = sortedOrders.shift()
  
          if (!firstElement) throw new Error("Order Element not found");
  
          accumulator = currency(accumulator).add(firstElement.salesAmount).toString()
  
          sortedPaymentShopOrders.push(firstElement)
  
        }
        sortedPaymentShopOrders.pop()
        paymentShopOrders = sortedPaymentShopOrders
        const newSelectedOrdersIds = sortedPaymentShopOrders.map((item) => item.id)
        input.selected_orders_ids = newSelectedOrdersIds
      }

      const paymentShopOrdersMap = new Map<number, Orders>()
      paymentShopOrders.forEach((values) => paymentShopOrdersMap.set(values.id, values))

      const paymentTransactions = await tx.select().from(transactions).where(inArray(transactions.shopOrdersId, input.selected_orders_ids));

      // Write transactions to database
      // create payments for the orders
      const defaultCurrencyEquivalentTotal = input.payments_details.reduce((accumulator, currentValue) => {
        return currency(accumulator).add(currentValue.defaultCurrencyEquivalent).toString()
      }, '0')

      const paymentId = await tx.insert(payments).values({
        userId: ctx.session.user.userId,
        customerId: input.customerId,
        exchangeRateId: input.exchangeRateId,
        defaultCurrencyEquivalentTotal,
      }).returning({ id: payments.id })

      await tx.transaction(async (tx2) => {
        input.payments_details.forEach(async (values) => {
          await tx2.insert(payments_details).values({ ...values, paymentsId: paymentId[0].id, userId: ctx.session.user.userId })
        })
      });


      // create transactions_details for the orders

      await tx.transaction(async (tx2) => {
        paymentTransactions.forEach(async (values) => {

          const currentOrder = paymentShopOrdersMap.get(values.shopOrdersId)
          if (!currentOrder) throw new Error("Transaction Shop Order not found");

          await tx2.insert(transactions_details).values({
            userId: ctx.session.user.userId,
            transactions_id: values.id,
            paymentsId: paymentId[0].id,
            amount_paid: currentOrder.salesAmount,
            fully_paid: true,
            active: true,
          })
        })
      });


      // update orders to paid

      await tx.transaction(async (tx2) => {
        paymentShopOrders.forEach(async (values) => {

          await tx2.update(shop_orders).set({
            paymentStatus: 'Paid',
            salesStatus: 'Receipt',
          }).where(eq(shop_orders.id, values.id))
        })
      });

      // Update contact amount

      const orderTotals = await tx.select({
        ordersTotals: sql<string>`COALESCE(sum(${shop_orders.salesAmount}), '0')`
      }).from(shop_orders).where(
        and(eq(shop_orders.customerId, input.customerId),
          and(ne(shop_orders.salesStatus, 'Quotation'), ne(shop_orders.salesStatus, 'Cancelled'))
        ))

      const totalSalesPaid = await tx.select({
        totalReceipts: sql<string>`COALESCE(sum(${payments.defaultCurrencyEquivalentTotal}), '0')`
      }).from(payments).where(eq(payments.customerId, input.customerId))

      const amount = currency(totalSalesPaid[0].totalReceipts).subtract(orderTotals[0].ordersTotals).toString()

      await tx.update(contacts).set({
        amount,
        ordersTotals: orderTotals[0].ordersTotals,
        totalReceipts: totalSalesPaid[0].totalReceipts
      }).where(eq(contacts.id, input.customerId))

    });

  } catch (error) {
    console.error("🚀 ~ file: payments.drizzle.ts:129 ~ makePayment ~ error:", error)
  }

  return { success: true }
}