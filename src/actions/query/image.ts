"use server";

import { sql } from "kysely";
import { getKysely } from "@/lib/kysely";

export const getImage = async () => {
  const kysely = await getKysely();

  const image = await kysely
    .selectFrom("Image")
    .selectAll()
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .executeTakeFirst();

  if (!image) {
    return null;
  }

  return image;
};
