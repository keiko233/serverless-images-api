import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";

import { UserRole } from "@/schema";

import { getKysely } from "./kysely";

export const auth = betterAuth({
  database: {
    db: getKysely(),
    type: "sqlite",
  },
  baseURL: env.BETTER_AUTH_URL,
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_SECRET,
    },
  },
  plugins: [
    tanstackStartCookies(),
    admin({
      defaultRole: UserRole.USER,
    }),
  ],
  trustedOrigins: [
    `${env.BETTER_AUTH_URL}/auth`,
    `${env.BETTER_AUTH_URL}/api/auth`,
    `${env.BETTER_AUTH_URL}`,
  ],
});
