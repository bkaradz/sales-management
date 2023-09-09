import { lucia } from "lucia";
import { postgres as postgresAdapter } from "@lucia-auth/adapter-postgresql";
import { sveltekit } from "lucia/middleware";
import { dev } from "$app/environment";
import { sql } from "../drizzle/client";


export const auth = lucia({
    adapter: postgresAdapter(sql, {
        user: "auth_user",
        key: "user_key",
        session: "user_session"
    }),
    env: dev ? "DEV" : "PROD",
    middleware: sveltekit(),
    transformDatabaseUser: (userData: { id: string; username: string; full_name: string; active: boolean; }) => {
		return {
			userId: userData.id,
			username: userData.username,
			full_name: userData.full_name,
			active: userData.active
		}
	}
});

export type Auth = typeof auth;