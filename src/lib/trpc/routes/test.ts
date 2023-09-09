import { db } from '$lib/server/drizzle/client';
import { router } from '$lib/trpc/t';
import { protectedProcedure } from '../middleware/auth';

export const test = router({
	getContacts: protectedProcedure.query(() =>
	db.query.contact.findMany({
			select: {
				id: true,
				full_name: true
			},
			orderBy: { updatedAt: 'desc' }
		})
	)
});
