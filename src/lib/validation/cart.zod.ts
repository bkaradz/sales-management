import { z } from 'zod';
import { EmbroideryTypeZod, GarmentPlacementZod, ProductCategoriesZod, SalesStatusZod } from './types.zod.typescript';

export const saveOrderSchema = z
  .object({
    customerId: z.number(),
    pricelistId: z.number(),
    exchangeRatesId: z.number(),
    salesStatus: SalesStatusZod,
    description: z.string().optional(),
    deliveryDate: z.string().datetime(),
    salesAmount: z.string(),
    totalProducts: z.number(),
  })

export type SaveOrder = z.infer<typeof saveOrderSchema>;
export type SaveOrderKeys = keyof SaveOrder;

export const saveOrderDetailsSchema = z
  .object({
    unitPrice: z.string(),
    quantity: z.number(),
    productId: z.number(),
    productCategory: ProductCategoriesZod,
		priceCalculated: z.boolean(),

    stitches: z.number().optional(),
    embroideryType: EmbroideryTypeZod.optional(),
    garmentPlacement: GarmentPlacementZod.optional(),
    pricelistId: z.number().optional(),
  }).superRefine((data, ctx) => {
		if (data.productCategory === 'Embroidery' && !data.stitches) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Stitches are required`,
				path: ['stitches']
			});
			z.NEVER;
		}
		if (data.productCategory === 'Embroidery' && !(data.embroideryType)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Embroidery Type is required`,
				path: ['embroideryType']
			});
		}
		if (data.productCategory === 'Embroidery' && !(data.garmentPlacement)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Garment Placement is required`,
				path: ['garmentPlacement']
			});
		}
		if (data.productCategory === 'Embroidery' && !(data.pricelistId)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Pricelist id is required`,
				path: ['pricelistId']
			});
		}
	});

export type SaveOrderDetails = z.infer<typeof saveOrderDetailsSchema>;
export type SaveOrderDetailsKeys = keyof SaveOrderDetails;


export const saveCartOrderSchema = z
  .object({ order: saveOrderSchema, orders_details: z.array(saveOrderDetailsSchema) })

export type SaveCartOrder = z.infer<typeof saveCartOrderSchema>;
export type SaveCartOrderKeys = keyof SaveCartOrder;
