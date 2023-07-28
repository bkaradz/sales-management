import { z } from 'zod';

export const editUserSchema = z
	.object({
		id: z.number().optional(),
		name: z
			.string({
				required_error: 'Name is required',
				invalid_type_error: 'Name must be a string'
			})
			.min(3)
			.trim(),
		username: z
			.string({
				required_error: 'username is required',
				invalid_type_error: 'username must be a string'
			})
			.min(3)
			.trim(),
		password: z.string({
			required_error: 'Password is required',
			invalid_type_error: 'Password must be a string'
		})
	})
	.passthrough();

export type EditUser = z.infer<typeof editUserSchema>;
export type EditUserKeys = keyof EditUser;

export const userRegisterSchema = editUserSchema
	.omit({ password: true })
	.extend({
		password: z
			.string({
				required_error: 'Password is required',
				invalid_type_error: 'Password must be a string'
			})
			.min(5)
			.max(12),
		confirmPassword: z.string({
			required_error: 'Confirm Password is required',
			invalid_type_error: 'Confirm Password must be a string'
		})
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type UserRegister = z.infer<typeof userRegisterSchema>;
export type UserRegisterKeys = keyof UserRegister;


export const loginCredentialsSchema = z
	.object({
		username: z
			.string({ 
				required_error: 'username is required', 
				invalid_type_error: 'username must be a string' 
			}),
		password: z
			.string({
				required_error: 'Password is required',
				invalid_type_error: 'Password must be a string'
			})
	})
	.strict();

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type LoginCredentialsKeys = keyof LoginCredentials;