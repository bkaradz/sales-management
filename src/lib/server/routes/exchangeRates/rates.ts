import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from '$lib/trpc/middleware/auth';
import { getDefaultRates, createRate, deleteById, getById, getAllRates } from "./rates.drizzle";


export const rates = router({
    getDefaultRates: publicProcedure.query(async () => {
        return await getDefaultRates();
    }),
    getAllRates: protectedProcedure.query(async ({ ctx}) => {
        return await getAllRates(ctx);
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
        return await getById(input, ctx);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
        return await deleteById(input, ctx);
    }),
    createRate: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createRate(input, ctx);
    }),
});