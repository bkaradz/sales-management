import { protectedProcedure, publicProcedure } from '$lib/trpc/middleware/auth';
import { router } from '$lib/trpc/t';
import { z } from 'zod';
import { makePayment } from './payments.drizzle';

export const payments = router({
	makePayment: protectedProcedure.query(async ({ ctx }) => {
		return await makePayment(ctx);
	}),
	getById: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		// return await getById(input, ctx);
	}),
	deleteById: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		// return await deleteById(input, ctx);
	}),
	registerUser: publicProcedure.input(z.string()).mutation(async ({ input }) => {
		// return await registerUser(input);
	}),
	loginUser: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		// return await loginUser(input, ctx);
	}),
	logoutUser: publicProcedure.query(async ({ ctx }) => {
		try {
			// await logoutUser(ctx);
			
		} catch (error) {
		}
	}),
});
