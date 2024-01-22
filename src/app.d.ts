// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { TrpcServer } from "$lib/server/server";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: import("lucia").AuthRequest;
			trpc: TrpcServer;
		}
		// interface PageData {}
		// interface Platform {}
	}
	namespace Lucia {
		type Auth = import("$lib/server/lucia").Auth;
		type UserAttributes = {
			username: string
			full_name: string
			active: boolean
		};
	}
	namespace svelte.JSX {
		interface HTMLAttributes<T> {
			// onclickOutside?: (e: CustomEvent) => void
			onlongPress?: (event: CustomEvent) => void
		}
	}
}

export {};
