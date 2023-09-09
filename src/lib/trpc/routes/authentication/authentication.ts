import { router } from '$lib/trpc/t';
import { loginCredentialsSchema, userRegisterSchema } from '$lib/trpc/routes/authentication/authentication.validate';
import { protectedProcedure, publicProcedure } from '$lib/trpc/middleware/auth';
import { getAllUsers, loginUser, logoutUser, registerUser } from './authentication.drizzle';

export const authentication = router({
	getAllUsers: protectedProcedure.query(async () => {
		return await getAllUsers();
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
