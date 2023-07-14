import { publicProcedure, router } from '$lib/trpc/t';
import { loginCredentialsSchema, userRegisterSchema } from '$lib/validation/authentication.validate';
import { protectedProcedure } from '../middleware/auth';
import {  getAllUsersPrisma, loginUserPrisma, registerUserPrisma } from './authentication.prisma';

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
});
