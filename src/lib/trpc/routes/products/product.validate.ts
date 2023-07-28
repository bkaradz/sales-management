import { z } from 'zod';

export const saveProductsSchema = z
	.object({
		id: z.number().optional(),
		isActive: z.boolean().default(true),
		name: z
			.string({
				required_error: 'Product name is required',
				invalid_type_error: 'Name must be a string'
			})
			.min(1)
			.trim(),
		description: z.string().optional().or(z.null()),
		productCategories: z.string({ required_error: 'Product Category is required' }).min(1),
		stitches: z.number().optional(),
		unitPrice: z.number().optional().or(z.object({})),
		units: z.number().optional().or(z.null())
	})
	.superRefine((data, ctx) => {
		if (data.productCategories === 'embroidery' && !data.stitches) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Stitches are required`,
				path: ['stitches']
			});
			z.NEVER;
		}
		if (data.productCategories !== 'embroidery' && !(data.unitPrice && data.units)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Unit Price and Units are required`,
				path: ['unitPrice', 'units']
			});
		}
	});

export type saveProduct = z.infer<typeof saveProductsSchema>;
export type saveProductKeys = keyof saveProduct;
