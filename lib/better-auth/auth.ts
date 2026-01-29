import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import connectToDatabase from "@/db/mongoose";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export async function getAuth() {
  if (authInstance) return authInstance;

  const mongooseInstance = await connectToDatabase();
  const db = mongooseInstance?.connection.db;

  if (!db) throw new Error("MongoDB connection not found!");

  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;

  if (!secret || !baseURL) {
    throw new Error("BETTER_AUTH_SECRET and/or BETTER_AUTH_URL must be set!");
  }

  authInstance = betterAuth({
    database: mongodbAdapter(db as any),
    secret,
    baseURL,
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    plugins: [nextCookies()],
  });

  return authInstance;
}

export const auth = await getAuth();
