import { USD } from '@dinero.js/currencies';
import prisma from "../src/lib/server/prisma/client";
// import { auth } from '../src/lib/lucia/client';
// import logger from '../src/lib/utility/logger';
import { dinero } from 'dinero.js';
import { sveltekit } from 'lucia-auth/middleware'
import lucia from 'lucia-auth';
import prismaAdapter from "@lucia-auth/adapter-prisma";

import {
	contacts,
	exchangeRates,
	options,
	paymentTypeOptions,
	pricelists,
	products,
	users
} from './seedData';


type User = {
  userId: string,
  username: string,
  full_name: string
}

export const auth = lucia({
	adapter: prismaAdapter(prisma as any),
	env: 'DEV',
	middleware: sveltekit(),
	transformDatabaseUser: (userData) => {
		return {
			userId: userData.id,
			username: userData.username,
			full_name: userData.full_name
		}
	}
});


async function main() {
	await prisma.contacts.deleteMany();
	await prisma.email.deleteMany();
	await prisma.phone.deleteMany();
	await prisma.address.deleteMany();
	await prisma.products.deleteMany();

	users.forEach(async (user) => {
		const { full_name, username, password, active } = user

		const newUser = await auth.createUser({
			key: {
				providerId: 'username',
				providerUserId: username,
				password
			},
			attributes: {
				full_name,
				username,
				active
			}
		}) as User

		const admin = await Promise.all([newUser]);
		const adminId = admin[0].userId;

		contacts.forEach(async (contact) => {
			await prisma.contacts.create({
				data: {
					created_by: adminId,
					...contact,
					isActive: true,
					isCorporate: false,
					email: {
						create: contact.email
					},
					phone: {
						create: contact.phone
					},
					address: {
						create: contact.address
					}
				}
			});
		});

		products.forEach(async (product) => {
			await prisma.products.create({
				data: {
					created_by: adminId,
					...product
				}
			});
		});
		
	});
	
}

main()
	.catch((e) => {
		console.error(`Error: ${e}`)
		process.exit(1);
	})
	.finally(() => {
		prisma.$disconnect();
	});
