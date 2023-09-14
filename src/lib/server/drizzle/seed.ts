
import { contactsList, productsList, usersList } from './seedData';
import { auth } from '../lucia/clientSeed';
import { db } from './client';
import { address, contacts, emails, key, phones, products, session, users } from './schema';


async function main() {
  await db.delete(key)
  await db.delete(session)
  await db.delete(phones)
  await db.delete(emails)
  await db.delete(address)
  await db.delete(contacts)
  await db.delete(products)
  await db.delete(users)

  usersList.forEach(async (user) => {
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
    })

    const admin = await Promise.all([newUser]);
    const adminId = admin[0].userId;

    const contactArray: any[] = []
    const phonesArray: any[] = []
    const emailsArray: any[] = []
    const addressArray: any[] = []
    const productsArray: any[] = []

    contactsList.forEach(async (contact) => {
      const contactResult = await db.insert(contacts).values({ user_id: adminId, full_name: contact.full_name, active: true, is_corporate: false, }).returning({ id: contacts.id });
      console.log("🚀 ~ file: seed.ts:45 ~ contactsList.forEach ~ contactResult:", contactResult)
      contactArray.push(contactResult)
      if (contact?.phone) {
        contact.phone.forEach(async (item) => {
          const phoneResult = await db.insert(phones).values({ contact_id: contactResult[0].id, phone: item.phone })
          phonesArray.push(phoneResult)
        })
      }
      if (contact?.email) {
        contact.email.forEach(async (item) => {
          const emailResult = await db.insert(emails).values({ contact_id: contactResult[0].id, email: item.email })
          emailsArray.push(emailResult)
        })
      }
      if (contact?.address) {
        contact.address.forEach(async (item) => {
          const addressResult = await db.insert(address).values({ contact_id: contactResult[0].id, address: item.address })
          addressArray.push(addressResult)
        })
      }
    });

    await Promise.all(contactArray);
    await Promise.all(phonesArray);
    await Promise.all(emailsArray);
    await Promise.all(addressArray);

    productsList.forEach(async (product) => {
      const productsResults = await db.insert(products).values({ user_id: adminId, ...product }).returning()
      console.log("🚀 ~ file: seed.ts:74 ~ productsList.forEach ~ productsResults:", productsResults)
      productsArray.push(productsResults)
    });

    await Promise.all(productsArray);

  });
}

main().catch((e) => {
  console.error(`Error: ${e}`)
  process.exit(1);
}).finally(() => {
  console.log("Done seeding.....");
  // process.exit();
});
