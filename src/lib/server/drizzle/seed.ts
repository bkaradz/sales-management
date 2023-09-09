
import { contacts, products, users } from './seedData';
import { auth } from '../lucia/client';
import { db } from './client';
import { address, contact, email, phone, product } from './schema';


async function main() {
  await db.update(contact)
  await db.update(email)
  await db.update(phone) 
  await db.update(address) 
  await db.update(product) 

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
    })

    const admin = await Promise.all([newUser]);
    const adminId = admin[0].userId;

    contacts.forEach(async (contact) => {
      await db.insert(contact).values({
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
      await db.insert(product).values({
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
    console.log("Done");
  });
