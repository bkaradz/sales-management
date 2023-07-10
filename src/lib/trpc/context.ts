import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

export async function createContext(event: RequestEvent) {
	const session = await event.locals.auth.validate()

	if (session) {
		return {
			sessionId: session.sessionId,
			userId: session.userId,
			event
		};
	}

	return {
		sessionId: null,
		userId: null,
		event
	};
}

export type Context = inferAsyncReturnType<typeof createContext>;