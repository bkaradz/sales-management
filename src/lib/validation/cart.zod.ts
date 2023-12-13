import { z } from 'zod';
import { EmbroideryTypeZod, GarmentPlacementZod, ProductCategoriesZod, SalesStatusZod } from './types.zod.typescript';

export const saveOrderSchema = z
  .object({
    customer_id: z.number(),
    pricelist_id: z.number(),
    exchange_rates_id: z.number(),
    sales_status: SalesStatusZod,
    description: z.string().optional(),
    delivery_date: z.string().datetime(),
    sales_amount: z.string(),
    total_products: z.number(),
  })

export type SaveOrder = z.infer<typeof saveOrderSchema>;
export type SaveOrderKeys = keyof SaveOrder;

export const saveOrderDetailsSchema = z
  .object({
    unit_price: z.string(),
    quantity: z.number(),
    product_id: z.number(),
    product_category: ProductCategoriesZod,
		price_calculated: z.boolean(),

    stitches: z.number().optional(),
    embroidery_type: EmbroideryTypeZod.optional(),
    garment_placement: GarmentPlacementZod.optional(),
    pricelist_id: z.number().optional(),
  }).superRefine((data, ctx) => {
		if (data.product_category === 'Embroidery' && !data.stitches) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Stitches are required`,
				path: ['stitches']
			});
			z.NEVER;
		}
		if (data.product_category === 'Embroidery' && !(data.embroidery_type)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Embroidery Type is required`,
				path: ['embroidery_type']
			});
		}
		if (data.product_category === 'Embroidery' && !(data.garment_placement)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Garment Placement is required`,
				path: ['garment_placement']
			});
		}
		if (data.product_category === 'Embroidery' && !(data.pricelist_id)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Pricelist id is required`,
				path: ['pricelist_id']
			});
		}
	});

export type SaveOrderDetails = z.infer<typeof saveOrderDetailsSchema>;
export type SaveOrderDetailsKeys = keyof SaveOrderDetails;


export const saveCartOrderSchema = z
  .object({ order: saveOrderSchema, orders_details: z.array(saveOrderDetailsSchema) })

export type SaveCartOrder = z.infer<typeof saveCartOrderSchema>;
export type SaveCartOrderKeys = keyof SaveCartOrder;
