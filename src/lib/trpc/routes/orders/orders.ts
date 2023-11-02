import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { createOrder, updateOrder, deleteById, getById, getOrders, changeSalesStatusById } from "./orders.drizzle";


export const orders = router({
    getOrders: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getOrders(input, ctx);
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input, ctx  }) => {
        return await getById(input, ctx);
    }),
    changeSalesStatusById: protectedProcedure.input(z.object({id: z.number(), sales_status: z.string()})).query(async ({ input, ctx  }) => {
        return await changeSalesStatusById(input, ctx);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
        return await deleteById(input, ctx);
    }),
    createOrder: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createOrder(input, ctx);
    }),
    updateOrder: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await updateOrder(input, ctx);
    }),
});