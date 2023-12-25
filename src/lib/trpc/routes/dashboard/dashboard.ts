import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { router } from '$lib/trpc/t';
import { incomeMonth, incomeToday } from './dashboard.drizzle';

export const dashboard = router({
	incomeToday: protectedProcedure.query(async ({ ctx }) => {
		return await incomeToday(ctx);
	}),
	incomeMonth: protectedProcedure.query(async ({ ctx }) => {
		return await incomeMonth(ctx);
	}),
});