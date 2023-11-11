import { z } from 'zod';
import { ProductCategoriesZod } from './types.zod.typescript';

export const currencyZodObject = z.object({
  amount: z.number(),
  currency: z.object({
    code: z.string(),
    base: z.number(),
    exponent: z.number()
  }),
  scale: z.number()
})

export const saveProductsSchema = z
	.object({
		name: z
			.string({
				required_error: 'Name is required',
				invalid_type_error: 'Name must be a string'
			})
			.min(1)
			.trim(),
		description: z.string().optional(),
		product_category: ProductCategoriesZod,
		stitches: z.number().optional(),
		unit_price: currencyZodObject.optional(),
		quantity: z.number().optional()
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
		if (data.product_category !== 'Embroidery' && !(data.unit_price)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Unit Price is required`,
				path: ['unit_price']
			});
		}
		if (data.product_category !== 'Embroidery' && !(data.quantity)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Quantity is required`,
				path: ['quantity']
			});
		}
	});

export type saveProduct = z.infer<typeof saveProductsSchema>;
export type saveProductKeys = keyof saveProduct;
