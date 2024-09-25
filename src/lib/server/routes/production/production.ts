import { z } from "zod";
import { protectedProcedure, router } from "$lib/server/trpc";
import { getProductionOrders, changeProductionStatusById } from "./production.drizzle";
import { PaymentStatusZod, ProductionStatusZod, SalesStatusZod } from "$lib/validation/types.zod.typescript";


export const production = router({
    getProductionOrders: protectedProcedure.input(z.any()).query(async ({ input, ctx }) => {
        return await getProductionOrders(input, ctx);
    }),
    changeProductionStatusById: protectedProcedure.input(z.object({
        id: z.number(),
        salesStatus: SalesStatusZod,
        paymentStatus: PaymentStatusZod,
        productionStatus: ProductionStatusZod
    })).query(async ({ input, ctx }) => { return await changeProductionStatusById(input, ctx); }),
});