import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import { saveContactsSchema } from "$lib/trpc/routes/contacts/contact.validate";
import { getContacts, createContact, deleteById, getById, uploadContacts, updateContact } from "./contacts.drizzle";


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
    createContact: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createContact(input, ctx);
    }),
    updateContact: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await updateContact(input, ctx);
    })
});