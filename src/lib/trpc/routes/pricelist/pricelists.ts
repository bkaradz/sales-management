import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
// import { savePricelistsSchema } from "$lib/trpc/routes/pricelists/pricelists.validate";
import { getDefaultPricelists, createPricelist, deleteById, getById, uploadPricelists, updatePricelist } from "./pricelists.drizzle";


export const pricelists = router({
    getDefaultPricelists: protectedProcedure.query(async () => {
        return await getDefaultPricelists();
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
        return await getById(input);
    }),
    uploadPricelists: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await uploadPricelists(input, ctx);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        return await deleteById(input);
    }),
    createPricelist: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createPricelist(input, ctx);
    }),
    updatePricelist: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await updatePricelist(input, ctx);
    })
});