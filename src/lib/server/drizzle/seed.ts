
import { contactsList, productsList, usersList, pricelistData, exchangeRates } from './seedData';
import { auth } from '../lucia/clientSeed';
import { db } from './client';
import { address, contacts, emails, exchange_rate_details, exchange_rates, key, phones, pricelist, pricelist_details, products, session, users } from './schema/schema';
import type { EmbroideryTypeUnion, currencyTypeUnion } from '$lib/utility/lists.utility';

const contactArray: any[] = []
const phonesArray: any[] = []
const emailsArray: any[] = []
const addressArray: any[] = []
const productsArray: any[] = []


async function main() {
  console.info("seeding started.....");
  const deleteArray = []
  deleteArray.push(await db.delete(pricelist))
  deleteArray.push(await db.delete(pricelist_details))
  deleteArray.push(await db.delete(exchange_rates))
  deleteArray.push(await db.delete(exchange_rate_details))
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



    // contactsList.forEach(async (contact) => {
    //   const contactResult = await db.insert(contacts).values({ user_id: adminId, full_name: contact.full_name, active: true, is_corporate: false, }).returning({ id: contacts.id });
    //   contactArray.push(contactResult)
      
    //   if (contact?.phone) {
    //     contact.phone.forEach(async (item) => {
    //       const phoneResult = await db.insert(phones).values({ contact_id: contactResult[0].id, phone: item.phone })
    //       phonesArray.push(phoneResult)
    //     })
    //   }
    //   if (contact?.email) {
    //     contact.email.forEach(async (item) => {
    //       const emailResult = await db.insert(emails).values({ contact_id: contactResult[0].id, email: item.email })
    //       emailsArray.push(emailResult)
    //     })
    //   }
    //   if (contact?.address) {
    //     contact.address.forEach(async (item) => {
    //       const addressResult = await db.insert(address).values({ contact_id: contactResult[0].id, address: item.address })
    //       addressArray.push(addressResult)
    //     })
    //   }
    // });

    pricelistData.forEach(async (priceList) => {

      const pricelistResult = await db.insert(pricelist).values({ user_id: adminId, name: priceList.name, active: priceList.active, default: priceList.default }).returning({ id: pricelist.id });

      priceList.pricelist_details.forEach(async (detail) => {
        await db.insert(pricelist_details).values({
          pricelist_id: pricelistResult[0].id,
          embroidery_types: detail.embroidery_types as EmbroideryTypeUnion,
          minimum_quantity: detail.minimum_quantity,
          minimum_price: detail.minimum_price.toString(),
          price_per_thousand_stitches: detail.price_per_thousand_stitches.toString()
        })
      })
    });

    exchangeRates.forEach(async (rates) => {

      const exchangeRatesResult = await db.insert(exchange_rates).values({ user_id: adminId, active: rates.active, default: rates.default }).returning({ id: exchange_rates.id });

      rates.exchange_rate_details.forEach(async (detail) => {
        await db.insert(exchange_rate_details).values({
          exchange_rates_id: exchangeRatesResult[0].id,
          name: detail.name,
          currency: detail.currency as currencyTypeUnion,
          rate: detail.rate.toString()
        })
      })
    });

    // productsList.forEach(async (product) => {
    //   const productsResults = await db.insert(products).values({ user_id: adminId, ...product }).returning()
    //   productsArray.push(productsResults)
    // });

  });
  return await Promise.all([
    await Promise.all(contactArray),
    await Promise.all(phonesArray),
    await Promise.all(emailsArray),
    await Promise.all(addressArray),
    await Promise.all(productsArray),
  ])
}

main().then(async(data) => {
  console.info("Data", data);
  // process.exit(0);
}).catch((e) => {
  console.error(`Error: ${e}`)
  process.exit(0);
})
// .finally(async () => {
//   await Promise.all(contactArray);
//   await Promise.all(phonesArray);
//   await Promise.all(emailsArray);
//   await Promise.all(addressArray);
//   await Promise.all(productsArray);
//   console.info("Done seeding.....");
//   // process.exit(0);
// });