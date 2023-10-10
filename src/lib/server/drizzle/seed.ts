
import { contactsList, productsList, usersList } from './seedData';
import { auth } from '../lucia/clientSeed';
import { db } from './client';
import { address, contacts, emails, key, phones, products, session, users } from './schema';


async function main() {
  console.info("seeding started.....");
  const deleteArray = []
  deleteArray.push(await db.delete(key))
  deleteArray.push(await db.delete(session))
  deleteArray.push(await db.delete(phones))
  deleteArray.push(await db.delete(emails))
  deleteArray.push(await db.delete(address))
  deleteArray.push(await db.delete(contacts))
  deleteArray.push(await db.delete(products))
  deleteArray.push(await db.delete(users))

  await Promise.all(deleteArray);

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
      productsArray.push(productsResults)
    });

    await Promise.all(productsArray);

    console.info("seeding finished.....");
    // process.exit(0);
  });
}

main().catch((e) => {
  console.error(`Error: ${e}`)
  process.exit(0);
}).finally(() => {
  console.info("Done seeding.....");
  // process.exit(0);
});