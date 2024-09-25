
import { contactsList, productsList, usersList, pricelistData, exchangeRates } from './seedData';
import { lucia } from '../lucia/client';
import { db } from './client';
import { address, contacts, emails, exchangeRateDetails, exchangeRates, phones, pricelist, pricelist_details, products, session, user } from './schema/schema';
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
  deleteArray.push(await db.delete(exchangeRates))
  deleteArray.push(await db.delete(exchangeRateDetails))
  deleteArray.push(await db.delete(session))
  deleteArray.push(await db.delete(phones))
  deleteArray.push(await db.delete(emails))
  deleteArray.push(await db.delete(address))
  deleteArray.push(await db.delete(contacts))
  deleteArray.push(await db.delete(products))
  deleteArray.push(await db.delete(user))

  await Promise.all(deleteArray);

  usersList.forEach(async (user) => {
    const { fullName, username, password, active } = user

    const newUser = await lucia.createUser({
      key: {
        providerId: 'username',
        providerUserId: username,
        password
      },
      attributes: {
        fullName,
        username,
        active
      }
    })

    const admin = await Promise.all([newUser]);
    const adminId = admin[0].userId;

    contactsList.forEach(async (contact) => {
      const contactResult = await db.insert(contacts).values({ userId: adminId, fullName: contact.fullName, active: true, isCorporate: false, }).returning({ id: contacts.id });
      contactArray.push(contactResult)
      
      if (contact?.phone) {
        contact.phone.forEach(async (item) => {
          const phoneResult = await db.insert(phones).values({ contactId: contactResult[0].id, phone: item.phone })
          phonesArray.push(phoneResult)
        })
      }
      if (contact?.email) {
        contact.email.forEach(async (item) => {
          const emailResult = await db.insert(emails).values({ contactId: contactResult[0].id, email: item.email })
          emailsArray.push(emailResult)
        })
      }
      if (contact?.address) {
        contact.address.forEach(async (item) => {
          const addressResult = await db.insert(address).values({ contactId: contactResult[0].id, address: item.address })
          addressArray.push(addressResult)
        })
      }
    });

    pricelistData.forEach(async (priceList) => {

      const pricelistResult = await db.insert(pricelist).values({ userId: adminId, name: priceList.name, active: priceList.active, default: priceList.default }).returning({ id: pricelist.id });

      priceList.pricelist_details.forEach(async (detail) => {
        await db.insert(pricelist_details).values({
          pricelistId: pricelistResult[0].id,
          embroideryTypes: detail.embroideryTypes as EmbroideryTypeUnion,
          minimumQuantity: detail.minimumQuantity,
          minimumPrice: detail.minimum_price.toString(),
          pricePerThousandStitches: detail.pricePerThousandStitches.toString()
        })
      })
    });

    exchangeRates.forEach(async (rates) => {

      const exchangeRatesResult = await db.insert(exchangeRates).values({ userId: adminId, active: rates.active, default: rates.default }).returning({ id: exchangeRates.id });

      rates.exchangeRateDetails.forEach(async (detail) => {
        await db.insert(exchangeRateDetails).values({
          exchangeRatesId: exchangeRatesResult[0].id,
          name: detail.name,
          currency: detail.currency as currencyTypeUnion,
          rate: detail.rate.toString()
        })
      })
    });

    productsList.forEach(async (product) => {
      const productsResults = await db.insert(products).values({ userId: adminId, ...product }).returning()
      productsArray.push(productsResults)
    });

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
