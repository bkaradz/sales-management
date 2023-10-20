import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from '$lib/trpc/middleware/auth';
import { getDefaultPricelists, createPricelist, deleteById, getById, getAllPricelists } from "./pricelists.drizzle";


export const pricelists = router({
    getDefaultPricelists: publicProcedure.query(async () => {
        return await getDefaultPricelists();
    }),
    getAllPricelists: protectedProcedure.query(async () => {
        return await getAllPricelists();
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
        return await getById(input);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        return await deleteById(input);
    }),
    createPricelist: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createPricelist(input, ctx);
    }),
});