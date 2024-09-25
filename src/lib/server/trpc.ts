import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import { transformer } from '$lib/trpc/transformer';
import { TRPCError } from '@trpc/server';

const t = initTRPC.context<Context>().create({
	// transformer,
});

export const router = t.router;

export const publicProcedure = t.procedure;

const isAuthenticated = t.middleware(async ({ next, ctx }) => {
	if (!ctx?.session?.id) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You are not authorized to use is resource'
		});
	}
	return next();
});

export const protectedProcedure = t.procedure.use(isAuthenticated);