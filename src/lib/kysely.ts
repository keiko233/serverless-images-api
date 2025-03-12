import { getRequestContext } from "@cloudflare/next-on-pages";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { Database } from "@/schema";
import "server-only";

export const runtime = "edge";

let cachedKysely: Kysely<Database> | null = null;

// MUST BE ASYNC FUNCTION
export const getKysely = async () => {
  const { env } = getRequestContext();

  const dialect = new D1Dialect({ database: env.DB });

  if (cachedKysely) {
    return cachedKysely;
  }

  cachedKysely = new Kysely<Database>({ dialect });

  return cachedKysely;
};
