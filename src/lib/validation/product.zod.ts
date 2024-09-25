import { z } from 'zod';
import { ProductCategoriesZod } from './types.zod.typescript';



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
		productCategory: ProductCategoriesZod,
		stitches: z.number().optional(),
		productUnitPrice: z.string().optional(),
		storkQuantity: z.number().optional()
	})
	.superRefine((data, ctx) => {
		if (data.productCategory === 'Embroidery' && !data.stitches) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Stitches are required`,
				path: ['stitches']
			});
			z.NEVER;
		}
		if (data.productCategory !== 'Embroidery' && !(data.productUnitPrice)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Unit Price is required`,
				path: ['unitPrice']
			});
		}
		if (data.productCategory !== 'Embroidery' && !(data.storkQuantity)) {
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
