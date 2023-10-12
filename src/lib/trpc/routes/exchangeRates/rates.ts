import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { getDefaultRates, createRate, deleteById, getById, getAllRates } from "./rates.drizzle";


export const rates = router({
    getDefaultRates: protectedProcedure.query(async () => {
        return await getDefaultRates();
    }),
    getAllRates: protectedProcedure.query(async () => {
        return await getAllRates();
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
        return await getById(input);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        return await deleteById(input);
    }),
    createRate: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createRate(input, ctx);
    }),
});