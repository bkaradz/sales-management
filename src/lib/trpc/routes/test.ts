import prisma from '$lib/server/prisma/client';
import { router } from '$lib/trpc/t';
import { protectedProcedure } from '../middleware/auth';

export const test = router({
	getContacts: protectedProcedure.query(() =>
		prisma.contacts.findMany({
			select: {
				id: true,
				name: true
			},
			orderBy: { updatedAt: 'desc' }
		})
	)
});
