import { router } from '$lib/trpc/t';
import { searchParamsSchema } from '$lib/validation/searchParams.validate';
import { z } from 'zod';
import { protectedProcedure } from '$lib/trpc/middleware/auth';
import { createProduct, deleteById, getById, getProducts, updateProduct, uploadProducts } from './products.drizzle';


export const products = router({
	getProducts: protectedProcedure.input(searchParamsSchema.passthrough()).query(async ({ input, ctx }) => {
		return await getProducts(input, ctx);
	}),
	getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
		return await getById(input, ctx);
	}),
	uploadProducts: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
		return await uploadProducts(input, ctx);
	}),
	deleteById: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
		return await deleteById(input, ctx);
	}),
	createProduct: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
		return await createProduct(input, ctx);
	}),
	updateProduct: protectedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
		return await updateProduct(input, ctx);
	})
});
