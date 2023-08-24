import { auth } from "$lib/server/lucia/client"
import prisma from "$lib/server/prisma/client"
import type { LoginCredentials, UserRegister } from "$lib/trpc/routes/authentication/authentication.validate"
import { redirect } from "@sveltejs/kit"
import type { Context } from "$lib/trpc/context"


export const registerUserPrisma = async (input: UserRegister) => {

  const { full_name, username, password } = input

  const usersCount = await prisma.authUser.count()

  let active = false

  if (usersCount < 1) active = true // if no user exist create Admin user

  await auth.createUser({
    primaryKey: {
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

export const loginUserPrisma = async (input: LoginCredentials, ctx: Context) => {

  const { username, password } = input

  const key = await auth.useKey('username', username, password)
  const session = await auth.createSession(key.userId)
  ctx.event.locals.auth.setSession(session)

}

export const logoutUserPrisma = async ( ctx: Context) => {

  const { session, user } = await ctx.event.locals.auth.validateUser()

  if (!user) {
      throw redirect(302, `/`)
  }

  await auth.invalidateSession(session.sessionId)
  ctx.event.locals.auth.setSession(null)

}

export const getAllUsersPrisma = async () => {

  return await prisma.authUser.findMany()

}