import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { getDailyProductionReport, getSalesReports } from "./reports.drizzle";


export const reports = router({
    getSalesReports: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getSalesReports(input, ctx);
    }),
    getDailyProductionReport: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getDailyProductionReport(input, ctx);
    }),
});