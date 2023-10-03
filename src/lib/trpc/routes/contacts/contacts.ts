import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import { saveContactsSchema } from "$lib/trpc/routes/contacts/contact.validate";
import { getContacts, saveOrUpdateContact, deleteById, getById, uploadContacts } from "./contacts.drizzle";


export const contacts = router({
    getContacts: protectedProcedure.input(searchParamsSchema.passthrough()).query(async ({ input }) => {
        return await getContacts(input);
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
        return await getById(input);
    }),
    uploadContacts: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await uploadContacts(input, ctx);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        return await deleteById(input);
    }),
    saveOrUpdateContact: protectedProcedure.input(saveContactsSchema).mutation(async ({ input, ctx }) => {
        return await saveOrUpdateContact(input, ctx);
    })
});