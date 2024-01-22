import { auth } from "$lib/server/lucia/client";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";


export const second: Handle = async ({ event, resolve }) => {

	const theme = event.cookies.get('siteTheme')

	event.locals.auth = auth.handleRequest(event);
	
	return await resolve(event, {
		transformPageChunk: ({html}) => html.replace('class=""', `class="${theme}"`)
	});
};

export const handle: Handle = sequence(second);