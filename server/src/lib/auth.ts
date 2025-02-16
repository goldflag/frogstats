import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

type AuthType = ReturnType<typeof betterAuth> | null;

export let auth: AuthType | null = null;

export const initAuth = (allowList: string[]) => {
  auth = betterAuth({
    basePath: "/auth",
    database: new pg.Pool({
      host: process.env.POSTGRES_HOST || "postgres",
      port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [username()],
    trustedOrigins: allowList,
  });
};
