import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { router } from '$lib/trpc/t';
import { z } from 'zod';
import { makePayment } from './payments.drizzle';

export const payments = router({
	makePayment: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
		return await makePayment(input, ctx);
	}),
});
