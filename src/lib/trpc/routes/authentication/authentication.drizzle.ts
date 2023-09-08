import { auth } from "$lib/server/lucia/client"
import type { LoginCredentials, UserRegister } from "$lib/trpc/routes/authentication/authentication.validate"
import { redirect } from "@sveltejs/kit"
import type { Context } from "$lib/trpc/context"
import { db } from "$lib/server/drizzle/client"
import { sql } from "drizzle-orm"
import { users } from "$lib/server/drizzle/schema"


export const registerUser = async (input: UserRegister) => {

  const { full_name, username, password } = input

  const usersCount = await db.select({ count: sql<number>`count(*)` }).from(users)

  let active = false

  if (usersCount[0].count < 1) active = true // if no user exist create Admin user

  await auth.createUser({
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

}

export const loginUser = async (input: LoginCredentials, ctx: Context) => {

  const { username, password } = input

  const key = await auth.useKey('username', username, password)
  const user = await auth.getUser(key.userId);
  const session = await auth.createSession({ userId: key.userId, attributes: {} })
  ctx.event.locals.auth.setSession(session)
}

export const logoutUser = async (ctx: Context) => {

  const session = await ctx.event.locals.auth.validate()

  if (!session) {
    throw redirect(302, `/`)
  }

  await auth.invalidateSession(session.sessionId)
  ctx.event.locals.auth.setSession(null)

}

export const getAllUsers = async () => {

  return await db.query.users.findMany({})

}