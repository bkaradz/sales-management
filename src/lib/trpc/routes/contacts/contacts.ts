import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { deleteByIdPrisma, getByIdPrisma, getContactsPrisma, getCorporatePrisma, saveOrUpdateContactPrisma } from "./contacts.prisma";
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import { saveContactsSchema } from "$lib/trpc/routes/contacts/contact.validate";


export const contacts = router({
    getContacts: protectedProcedure
        .input(searchParamsSchema.passthrough())
        .query(async ({ input }) => {
            return await getContactsPrisma(input);
        }),
    getCorporate: protectedProcedure
        .input(searchParamsSchema.passthrough())
        .query(async ({ input }) => {
            return await getCorporatePrisma(input);
        }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
        return await getByIdPrisma(input);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        return await deleteByIdPrisma(input);
    }),
    saveOrUpdateContact: protectedProcedure
        .input(saveContactsSchema)
        .mutation(async ({ input, ctx }) => {
            return await saveOrUpdateContactPrisma(input, ctx);
        })
});