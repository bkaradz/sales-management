import { auth } from "$lib/server/lucia/client";
import type { Handle } from "@sveltejs/kit";
import { createTRPCHandle } from "trpc-sveltekit";
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { sequence } from "@sveltejs/kit/hooks";


export const first: Handle = createTRPCHandle({ router, createContext });

export const second: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event);
	return await resolve(event);
};

export const handle: Handle = sequence(first, second);