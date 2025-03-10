import {
  adminClient,
  organizationClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  plugins: [
    usernameClient(),
    adminClient(),
    organizationClient(),
    stripeClient({
      subscription: true,
    }),
  ],
  fetchOptions: {
    credentials: "include",
  },
  socialProviders: ["google", "github", "twitter"],
});
