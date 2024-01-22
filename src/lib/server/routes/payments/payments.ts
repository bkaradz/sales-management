import { protectedProcedure, router } from "$lib/server/trpc";
import { z } from 'zod';
import { makePayment } from './payments.drizzle';

export const payments = router({
	makePayment: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
		return await makePayment(input, ctx);
	}),
});
