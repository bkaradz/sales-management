import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { createOrder, updateOrder, deleteById, getById, getOrders } from "./orders.drizzle";


export const orders = router({
    getOrders: protectedProcedure.input(z.any()).query(async ({ input }) => {
        return await getOrders(input);
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
        return await getById(input);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        return await deleteById(input);
    }),
    createOrder: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createOrder(input, ctx);
    }),
    updateOrder: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await updateOrder(input, ctx);
    }),
});