import { auth } from "$lib/server/lucia/client"
import type { LoginCredentials, UserRegister } from "$lib/validation/authentication.validate"
import type { Context } from "../context"


export const registerUserPrisma = async (input: UserRegister) => {

  const { name, username, password } = input

  await auth.createUser({
    primaryKey: {
      providerId: 'username',
      providerUserId: username,
      password
    },
    attributes: {
      name,
      username,
      active: true
    }
  })

}

export const loginUserPrisma = async (input: LoginCredentials, ctx: Context) => {

  const { username, password } = input

  const key = await auth.useKey('username', username, password)
  const session = await auth.createSession(key.userId)
  ctx.event.locals.auth.setSession(session)

}