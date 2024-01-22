import type { RequestEvent } from "@sveltejs/kit";
import type { inferAsyncReturnType } from "@trpc/server";

export const createContext = async (event: RequestEvent) => {
	let session = await event.locals.auth.validate()
	if (!session) {
		session = null
	}
	return {
		session,
		event
	}
};

export type Context = inferAsyncReturnType<typeof createContext>;
