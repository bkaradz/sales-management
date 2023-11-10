import { router } from '$lib/trpc/t';
import { searchParamsSchema } from '$lib/validation/searchParams.validate';
import { z } from 'zod';
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { createTransaction, deleteById, getById, getTransactions } from './transactions.drizzle';


export const transactions = router({
	getTransactions: protectedProcedure.input(searchParamsSchema.passthrough()).query(async ({ input, ctx }) => {
		return await getTransactions(input, ctx);
	}),
	getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
		return await getById(input, ctx);
	}),
	deleteById: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
		return await deleteById(input, ctx);
	}),
	createTransaction: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
		return await createTransaction(input, ctx);
	})
});
