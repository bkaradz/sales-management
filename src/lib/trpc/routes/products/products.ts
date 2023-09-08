import { router } from '$lib/trpc/t';
import { saveProductsSchema } from '$lib/trpc/routes/products/product.validate';
import { searchParamsSchema } from '$lib/validation/searchParams.validate';
import { z } from 'zod';
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { deleteById, getById, getProducts, saveOrUpdateProducts } from './products.drizzle';


export const products = router({
	getProducts: protectedProcedure
		.input(searchParamsSchema.passthrough())
		.query(async ({ input }) => {
			return await getProducts(input);
		}),
	getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
		return await getById(input);
	}),
	deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
		return await deleteById(input);
	}),
	saveOrUpdateProducts: protectedProcedure
		.input(saveProductsSchema)
		.mutation(async ({ input, ctx }) => {
			return await saveOrUpdateProducts(input, ctx);
		})
});
