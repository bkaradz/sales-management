import prisma from "$lib/server/prisma/client";
import prismaAdapter from "@lucia-auth/adapter-prisma";
import { sveltekit } from 'lucia-auth/middleware'
import lucia from 'lucia-auth';
import { dev } from '$app/environment'


export const auth = lucia({
	adapter: prismaAdapter(prisma),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	transformDatabaseUser: (userData) => {
		return {
			userId: userData.id,
			username: userData.username,
			full_name: userData.full_name,
			active: userData.active
		}
	}
});


export type Auth = typeof auth