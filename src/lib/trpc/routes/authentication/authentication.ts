import { router } from '$lib/trpc/t';
import { loginCredentialsSchema, userRegisterSchema } from '$lib/trpc/routes/authentication/authentication.validate';
import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '$lib/trpc/middleware/auth';
import {  getAllUsersPrisma, loginUserPrisma, logoutUserPrisma, registerUserPrisma } from './authentication.prisma';

export const authentication = router({
	getAllUsers: protectedProcedure.query(async () => {
		return await getAllUsersPrisma();
	}),
	registerUser: publicProcedure.input(userRegisterSchema).mutation(async ({ input }) => {
		return await registerUserPrisma(input);
	}),
	loginUser: publicProcedure.input(loginCredentialsSchema).mutation(async ({ input, ctx }) => {
		return await loginUserPrisma(input, ctx);
	}),
	logoutUser: publicProcedure.query(async ({ ctx }) => {
		try {
			await logoutUserPrisma(ctx);
			
		} catch (error) {
		}
	}),
});
