
import { test } from '$lib/trpc/routes/test';
import { authentication } from '$lib/trpc/routes/authentication';
import { contacts } from '$lib/trpc/routes/contacts';
import { t } from '$lib/trpc/t';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const router = t.router({
	authentication,
	contacts,
	test,
});

export type Router = typeof router;

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;