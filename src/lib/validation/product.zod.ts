import { z } from 'zod';
import { ProductCategoriesZod, currencyZodObject } from './types.zod.typescript';



export const saveProductsSchema = z
	.object({
		id: z.number().optional(),
		name: z
			.string({
				required_error: 'Name is required',
				invalid_type_error: 'Name must be a string',
			})
			.min(3)
			.trim(),
		description: z.string().optional(),
		product_category: ProductCategoriesZod,
		stitches: z.number().optional(),
		product_unit_price: currencyZodObject.optional(),
		stork_quantity: z.number().optional()
	})
	.superRefine((data, ctx) => {
		if (data.product_category === 'Embroidery' && !data.stitches) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Stitches are required`,
				path: ['stitches']
			});
			z.NEVER;
		}
		if (data.product_category !== 'Embroidery' && !(data.product_unit_price)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Unit Price is required`,
				path: ['unit_price']
			});
		}
		if (data.product_category !== 'Embroidery' && !(data.stork_quantity)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Quantity is required`,
				path: ['quantity']
			});
		}
	});

export type saveProduct = z.infer<typeof saveProductsSchema>;
export type saveProductKeys = keyof saveProduct;

export const saveProductsArraySchema = z.array(saveProductsSchema)

export type saveProductArray = z.infer<typeof saveProductsArraySchema>;
export type saveProductArrayKeys = keyof saveProductArray;
