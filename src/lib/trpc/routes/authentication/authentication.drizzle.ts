import { auth } from "$lib/server/lucia/client"
import type { LoginCredentials, UserRegister } from "$lib/trpc/routes/authentication/authentication.validate"
import { error, redirect } from "@sveltejs/kit"
import type { Context } from "$lib/trpc/context"
import { db } from "$lib/server/drizzle/client"
import { eq, sql } from "drizzle-orm"
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

export const getUsers = async (ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }
 
  try {

		const userQuery = await db.select().from(users)

		return {
			users: userQuery,
		}

	} catch (error) {
		console.error("🚀 ~ file: authentication.drizzle.ts:74 ~ getById ~ error:", error)
	}

}

export const getById = async (input: string, ctx: Context ) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

		const userQuery = await db.select().from(users).where(eq(users.id, input))

		return userQuery[0]
		
	} catch (error) {
		console.error("🚀 ~ file: authentication.drizzle.ts:74 ~ getById ~ error:", error)
	}
}

export const deleteById = async (input: string, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }
  
  try {

		await db.update(users).set({ active: false }).where(eq(users.id, input));

		return {
			message: "success",
		}

	} catch (error) {
		console.error("🚀 ~ file: authentication.drizzle.ts:89 ~ deleteById ~ error:", error)
	}
}