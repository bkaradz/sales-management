import { z } from "zod";
import { protectedProcedure, router } from "$lib/server/trpc";
import { createOrder, deleteById, getById, changeSalesStatusById, getOrdersByUserId, getOrdersByProductId, getOrdersAwaitingPaymentByUserId, getOrdersLine } from "./orders.drizzle";
import { PaymentStatusZod, SalesStatusZod } from "$lib/validation/types.zod.typescript";


export const shop_orders = router({
    getOrdersLine: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getOrdersLine(input, ctx);
    }),
    getOrdersByUserId: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getOrdersByUserId(input, ctx);
    }),
    getOrdersAwaitingPaymentByUserId: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getOrdersAwaitingPaymentByUserId(input, ctx);
    }),
    getOrdersByProductId: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getOrdersByProductId(input, ctx);
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
        return await getById(input, ctx);
    }),
    changeSalesStatusById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: SalesStatusZod,
        payment_status: PaymentStatusZod
    })).query(async ({ input, ctx }) => { return await changeSalesStatusById(input, ctx) }),
    deleteById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: SalesStatusZod,
        payment_status: PaymentStatusZod
    })).mutation(async ({ input, ctx }) => { return await deleteById(input, ctx) }),
    createOrder: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createOrder(input, ctx);
    })
});