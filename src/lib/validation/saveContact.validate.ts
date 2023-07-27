import { z } from 'zod';

export const saveContactsSchema = z
	.object({
		id: z.number().optional(),
		name: z
			.string({
				required_error: 'Name is required',
				invalid_type_error: 'Name must be a string'
			})
			.min(3)
			.trim(),
		email: z.array(
			z
				.object({
					email: z
						.string({
							required_error: 'Email is required'
						})
						.email()
				})
				.passthrough()
		),
		phone: z.array(
			z
				.object({
					phone: z
						.string({
							required_error: 'Phone is required'
						})
						.refine((data) => !data)
				})
				.passthrough()
		),
		address: z.array(
			z
				.object({
					address: z
						.string({
							required_error: 'Address is required'
						})
						.refine((data) => !data)
				})
				.passthrough()
		),
		isCorporate: z.boolean({ required_error: 'Corporate or Individual is required' }),
		isActive: z.boolean().default(true),
		organisationID: z.number().optional(),
		vatOrBpNo: z.string().optional()
	})
	.refine((data) => data.phone.length !== 0, {
		message: 'Phone array must have at least one phone number',
		path: ['phone']
	})
	.refine((data) => data.isCorporate === true && data.organisationID, {
		message: 'Only a person can belong to a Company',
		path: ['isCorporate']
	});

export type SaveContact = z.infer<typeof saveContactsSchema>;
export type SaveContactKeys = keyof SaveContact;
