import { trpcServer } from '$lib/server/server';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async (event) => {
  if (!event.locals.user) {
    return redirect(302, "/login");
  }
  return {
    user: event.locals.user
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async (event) => {
    await trpcServer.authentication.logoutUser.ssr(event)
  },
}