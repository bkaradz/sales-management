import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { router } from '$lib/trpc/t';
import { incomeDailyTotals, incomeMonth, incomeMonthTotals, incomeToday } from './dashboard.drizzle';

export const dashboard = router({
	incomeToday: protectedProcedure.query(async ({ ctx }) => {
		return await incomeToday(ctx);
	}),
	incomeMonth: protectedProcedure.query(async ({ ctx }) => {
		return await incomeMonth(ctx);
	}),
	incomeDailyTotals: protectedProcedure.query(async ({ ctx }) => {
		return await incomeDailyTotals(ctx);
	}),
	incomeMonthTotals: protectedProcedure.query(async ({ ctx }) => {
		return await incomeMonthTotals(ctx);
	}),
});