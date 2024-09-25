// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			// auth: import("lucia").AuthRequest;
			user: import("lucia").User | null;
			session: import("lucia").Session | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
	namespace Lucia {
		type Auth = import("$lib/server/lucia").Auth;
		type UserAttributes = {
			username: string
			fullName: string
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
