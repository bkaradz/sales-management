import { lucia } from "$lib/server/lucia/client"
import type { LoginCredentials, UserRegister } from "$lib/server/routes/authentication/authentication.validate"
import { error, fail, redirect } from "@sveltejs/kit"
import { db } from "$lib/server/drizzle/client"
import { eq, sql } from "drizzle-orm"
import { user } from "$lib/server/drizzle/schema/schema"
import { hash, verify } from "@node-rs/argon2";
import { generateId } from "lucia";
import type { Context } from "$lib/server/context"


export const registerUser = async (input: UserRegister) => {

  const { fullName, username, password } = input

  // Check if username already exist
  const existingUser = await db.select().from(user).where(eq(user.username,  username))

  if (existingUser.length > 0) {
    return fail(400, {
      message: "Username not available"
    });
  }

  const usersCount = await db.select({ count: sql<number>`count(*)` }).from(user)

  let active = false

  if (usersCount[0].count < 1) active = true // if no user exist create Admin user

  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
  const userId = generateId(15);

  await db.insert(user).values({
    id: userId,
    fullName: fullName,
    username,
    passwordHash,
    active
  });

  return { success: true }

}

export const loginUser = async (input: LoginCredentials, ctx: Context) => {
  console.log("🚀 ~ loginUser ~ ctx:", ctx)
  console.log("🚀 ~ loginUser ~ input:", input)

  const { username, password } = input

  const existingUser = await db.select().from(user).where(eq(user.username,  username))

  if (!existingUser) {
    return fail(400, {
      message: "Incorrect username or password"
    });
  }

  const validPassword = await verify(existingUser[0].passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });

  if (!validPassword) {
    return fail(400, {
      message: "Incorrect username or password"
    });
  }

  const session = await lucia.createSession(existingUser[0].id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	ctx.event.cookies.set(sessionCookie.name, sessionCookie.value, {
    path: ".",
    ...sessionCookie.attributes
  });

	return redirect(302, "/");
}

export const logoutUser = async (ctx: Context) => {

  if (!ctx.event.locals.session) {
    return fail(401, {
      message: "Session not found"
    });
  }

  await lucia.invalidateSession(ctx.event.locals.session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  ctx.event.cookies.set(sessionCookie.name, sessionCookie.value, {
    path: ".",
    ...sessionCookie.attributes
  });

  return redirect(302, "/login");

}

export const getUsers = async (ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }
 
  try {

		const userQuery = await db.select().from(user)

		return {
			users: userQuery,
		}

	} catch (error) {
		console.error("🚀 ~ file: authentication.drizzle.ts:74 ~ getById ~ error:", error)
	}

}

export const getById = async (input: string, ctx: Context ) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

		const userQuery = await db.select().from(user).where(eq(user.id, input))

		return userQuery[0]
		
	} catch (error) {
		console.error("🚀 ~ file: authentication.drizzle.ts:74 ~ getById ~ error:", error)
	}
}

export const deleteById = async (input: string, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }
  
  try {

		await db.update(user).set({ active: false }).where(eq(user.id, input));

		return {
			message: "success",
		}

	} catch (error) {
		console.error("🚀 ~ file: authentication.drizzle.ts:89 ~ deleteById ~ error:", error)
	}
}