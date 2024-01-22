import { z } from "zod";
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import { getContacts, createContact, deleteById, getById, uploadContacts, updateContact, getContactsList } from "./contacts.drizzle";
import { protectedProcedure, router } from "$lib/server/trpc";


export const contacts = router({
    getContacts: protectedProcedure.input(searchParamsSchema.passthrough()).query(async ({ input, ctx }) => {
        return await getContacts(input, ctx);
    }),
    getContactsList: protectedProcedure.input(searchParamsSchema.passthrough()).query(async ({ input, ctx }) => {
        return await getContactsList(input, ctx);
    }),
    getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
        return await getById(input, ctx);
    }),
    uploadContacts: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await uploadContacts(input, ctx);
    }),
    deleteById: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
        return await deleteById(input, ctx);
    }),
    createContact: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await createContact(input, ctx);
    }),
    updateContact: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
        return await updateContact(input, ctx);
    })
});