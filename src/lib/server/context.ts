import type { RequestEvent } from "@sveltejs/kit";
import type { inferAsyncReturnType } from "@trpc/server";
import { lucia } from "./lucia/client";

export const createContext = async (event: RequestEvent) => {
	const { session } = await lucia.validateSession(event.locals.session?.id || "");
	
	// if (!session) {
	// 	session = null
	// }
	return {
		session,
		event
	}
};

export type Context = inferAsyncReturnType<typeof createContext>;
