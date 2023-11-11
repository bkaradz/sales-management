import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { createOrder, deleteById, getById, getOrders, changeSalesStatusById, getOrdersByUserId, getOrdersByProductId, getProductionOrders, changeProductionStatusById, getOrdersAwaitingPaymentByUserId } from "./orders.drizzle";
import { PaymentStatusZod, ProductionStatusZod, SalesStatusZod } from "$lib/validation/types.zod.typescript";


export const orders = router({
    getOrders: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getOrders(input, ctx);
    }),
    getProductionOrders: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getProductionOrders(input, ctx);
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
    }))
        .query(async ({ input, ctx }) => {
            return await changeSalesStatusById(input, ctx);
        }),
    changeProductionStatusById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: SalesStatusZod,
        payment_status: PaymentStatusZod,
        production_status: ProductionStatusZod
    }))
        .query(async ({ input, ctx }) => {
            return await changeProductionStatusById(input, ctx);
        }),
    deleteById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: SalesStatusZod,
        payment_status: PaymentStatusZod
    }))
        .mutation(async ({ input, ctx }) => {
            return await deleteById(input, ctx);
        }),
    createOrder: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createOrder(input, ctx);
    })
});