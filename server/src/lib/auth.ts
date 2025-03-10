import { betterAuth } from "better-auth";
import { username, admin, organization } from "better-auth/plugins";
import dotenv from "dotenv";
import pg from "pg";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/postgres/postgres.js";
import { IS_CLOUD } from "./const.js";
import * as schema from "../db/postgres/schema.js";
import { eq } from "drizzle-orm";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

dotenv.config();

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

type AuthType = ReturnType<typeof betterAuth> | null;

const pluginList = IS_CLOUD
  ? [
      admin(),
      organization({
        // Allow users to create organizations
        allowUserToCreateOrganization: true,
        // Set the creator role to owner
        creatorRole: "owner",
      }),
      stripe({
        stripeClient,
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
        createCustomerOnSignUp: true,
        subscription: {
          enabled: true,
          plans: [
            {
              id: "basic",
              priceId: "price_1R0w56DFVprnAny2n2QzYdsi",
              name: "Basic",
              interval: "month",
              limits: {
                events: 100000,
              },
            },
            {
              id: "pro",
              priceId: "price_1R0w5uDFVprnAny2T2AGF2sK",
              name: "Pro",
              interval: "month",
              limits: {
                events: 100000,
              },
            },
          ],
        },
      }),
    ]
  : [
      username(),
      admin(),
      organization({
        // Allow users to create organizations
        allowUserToCreateOrganization: true,
        // Set the creator role to owner
        creatorRole: "owner",
      }),
    ];

export let auth: AuthType | null = betterAuth({
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
  deleteUser: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: pluginList as any,
  trustedOrigins: ["http://localhost:3002"],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production", // don't mark Secure in dev
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    },
  },
});

export function initAuth(allowedOrigins: string[]) {
  auth = betterAuth({
    basePath: "/auth",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        // Map our schema tables to what better-auth expects
        user: schema.users,
        account: schema.account,
        session: schema.session,
        verification: schema.verification,
        organization: schema.organization,
        member: schema.member,
      },
    }),
    experimental: {
      sessionCookie: {
        domains: allowedOrigins,
      },
    },
    emailAndPassword: {
      enabled: true,
      // Disable email verification for now
      requireEmailVerification: false,
    },
    // socialProviders: {
    //   google: {
    //     clientId: process.env.GOOGLE_CLIENT_ID!,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   },
    //   github: {
    //     clientId: process.env.GITHUB_CLIENT_ID!,
    //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    //   },
    //   twitter: {
    //     clientId: process.env.TWITTER_CLIENT_ID!,
    //     clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    //   },
    // },
    deleteUser: {
      enabled: true,
    },
    user: {
      deleteUser: {
        enabled: true,
        // Add a hook to run before deleting a user
        // i dont think this works
        beforeDelete: async (user) => {
          // Delete all memberships for this user first
          console.log(
            `Cleaning up memberships for user ${user.id} before deletion`
          );
          try {
            // Delete member records for this user
            await db
              .delete(schema.member)
              .where(eq(schema.member.userId, user.id));

            console.log(`Successfully removed memberships for user ${user.id}`);
          } catch (error) {
            console.error(
              `Error removing memberships for user ${user.id}:`,
              error
            );
            throw error; // Re-throw to prevent user deletion if cleanup fails
          }
        },
      },
    },
    plugins: pluginList as any,
    trustedOrigins: allowedOrigins,
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      defaultCookieAttributes: {
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      },
    },
  });
}
