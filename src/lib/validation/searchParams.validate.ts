import { z } from 'zod';

export const searchParamsSchema = z
	.object({
		limit: z.number().optional(),
		page: z.number().optional(),
		search: z.string().optional()
	})
	.passthrough();

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type SearchParamsKeys = keyof SearchParams;
