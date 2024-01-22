import { protectedProcedure, router} from "$lib/server/trpc";
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