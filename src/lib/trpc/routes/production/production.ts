import { router } from "$lib/trpc/t";
import { z } from "zod";
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { getProductionOrders, changeProductionStatusById } from "./production.drizzle";
import { PaymentStatusZod, ProductionStatusZod, SalesStatusZod } from "$lib/validation/types.zod.typescript";


export const production = router({
    getProductionOrders: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getProductionOrders(input, ctx);
    }),
    changeProductionStatusById: protectedProcedure.input(z.object({
        id: z.number(),
        sales_status: SalesStatusZod,
        payment_status: PaymentStatusZod,
        production_status: ProductionStatusZod
    })).query(async ({ input, ctx }) => { return await changeProductionStatusById(input, ctx); }),
});