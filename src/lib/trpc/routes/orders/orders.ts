import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { createOrder, updateOrder, deleteById, getById, getOrders, changeSalesStatusById, getOrdersByUserId, getOrdersByProductId, getProductionOrders, changeProductionStatusById } from "./orders.drizzle";


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
    getOrdersByProductId: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getOrdersByProductId(input, ctx);
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
        return await getById(input, ctx);
    }),
    changeSalesStatusById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: z.enum(['Quotation', 'Sales Order', 'Invoice', 'Receipt', 'Cancelled']),
        payment_status: z.enum(['Awaiting Payment', 'Paid', 'Cancelled', 'Refunded', 'Awaiting Sales Order'])
    }))
        .query(async ({ input, ctx }) => {
            return await changeSalesStatusById(input, ctx);
        }),
    changeProductionStatusById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: z.enum(['Quotation', 'Sales Order', 'Invoice', 'Receipt', 'Cancelled']),
        payment_status: z.enum(['Awaiting Payment', 'Paid', 'Cancelled', 'Refunded', 'Awaiting Sales Order']),
        production_status: z.enum(['Origination', 'Awaiting Logo Approval', 'Received', 'Awaiting Embroidery', 'Embroidery', 'Awaiting Trimming', 'Trimming', 'Awaiting Collection', 'Collected'])
    }))
        .query(async ({ input, ctx }) => {
            return await changeProductionStatusById(input, ctx);
        }),
    deleteById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: z.enum(['Quotation', 'Sales Order', 'Invoice', 'Receipt', 'Cancelled']),
        payment_status: z.enum(['Awaiting Payment', 'Paid', 'Cancelled', 'Refunded', 'Awaiting Sales Order'])
    }))
        .mutation(async ({ input, ctx }) => {
            return await deleteById(input, ctx);
        }),
    createOrder: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createOrder(input, ctx);
    }),
    updateOrder: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await updateOrder(input, ctx);
    }),
});