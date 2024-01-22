import type { Router } from '$lib/server/routes/router';
import superjson from 'superjson';
import { createTRPCClient, type TRPCClientInit } from 'trpc-sveltekit';

let browserClient: ReturnType<typeof createTRPCClient<Router>>;

export function trpc(init?: TRPCClientInit) {
	if (typeof window === 'undefined') return createTRPCClient<Router>({ init });
	if (!browserClient)
		browserClient = createTRPCClient<Router>({
			transformer: superjson
		});
	return browserClient;
}
