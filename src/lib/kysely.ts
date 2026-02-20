import { env } from "cloudflare:workers";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

import { type Database } from "@/schema";

let cachedKysely: Kysely<Database> | null = null;

export const getKysely = () => {
  if (cachedKysely) {
    return cachedKysely;
  }

  const dialect = new D1Dialect({
    database: env.DB,
  });

  cachedKysely = new Kysely<Database>({
    dialect,
  });

  return cachedKysely;
};
