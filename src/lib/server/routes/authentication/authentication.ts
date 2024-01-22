import { router } from '$lib/trpc/t';
import { loginCredentialsSchema, userRegisterSchema } from '$lib/server/routes/authentication/authentication.validate';
import { protectedProcedure, publicProcedure } from '$lib/trpc/middleware/auth';
import { getUsers, loginUser, logoutUser, registerUser, getById, deleteById } from './authentication.drizzle';
import { z } from 'zod';

export const authentication = router({
	getUsers: protectedProcedure.query(async ({ ctx }) => {
		return await getUsers(ctx);
	}),
	getById: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		return await getById(input, ctx);
	}),
	deleteById: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		return await deleteById(input, ctx);
	}),
	registerUser: publicProcedure.input(userRegisterSchema).mutation(async ({ input }) => {
		return await registerUser(input);
	}),
	loginUser: publicProcedure.input(loginCredentialsSchema).mutation(async ({ input, ctx }) => {
		return await loginUser(input, ctx);
	}),
	logoutUser: publicProcedure.query(async ({ ctx }) => {
		try {
			await logoutUser(ctx);
			
		} catch (error) {
		}
	}),
});
