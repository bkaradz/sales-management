import type { Router } from '$lib/trpc/router';
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

// import type { Router } from '$lib/trpc/router';
// import { createTRPCClient, type TRPCClientInit } from 'trpc-sveltekit';

// let browserClient: ReturnType<typeof createTRPCClient<Router>>;

// export function trpc(init?: TRPCClientInit) {
//   const isBrowser = typeof window !== 'undefined';
//   if (isBrowser && browserClient) return browserClient;
//   const client = createTRPCClient<Router>({ init });
//   if (isBrowser) browserClient = client;
//   return client;
// }