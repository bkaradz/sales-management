import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from '$lib/server/trpc';
import { getDefaultPricelists, createPricelist, deleteById, getById, getAllPricelists } from "./pricelists.drizzle";


export const pricelists = router({
    getDefaultPricelists: publicProcedure.query(async () => {
        return await getDefaultPricelists();
    }),
    getAllPricelists: protectedProcedure.query(async ({ ctx }) => {
        return await getAllPricelists(ctx);
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
        return await getById(input, ctx);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
        return await deleteById(input, ctx);
    }),
    createPricelist: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createPricelist(input, ctx);
    }),
});