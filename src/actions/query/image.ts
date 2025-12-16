"use server";

import { sql } from "kysely";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEFAULT_CARD_PAGE_SIZE, RANDOM_CHARACTER_KEYWORD } from "@/consts";
import { getKysely } from "@/lib/kysely";
import { ac } from "@/lib/safe-action";
import {
  CreateImageParams,
  GetImagesParams,
  UpdateImageTagsByIdSchema,
} from "./schema";

export const getImage = async (options?: { character?: string }) => {
  const kysely = await getKysely();

  // If character is "random" or not specified, return a random image
  if (!options?.character || options.character === RANDOM_CHARACTER_KEYWORD) {
    return kysely
      .selectFrom("Image")
      .selectAll()
      .orderBy(sql`RANDOM()`)
      .limit(1)
      .executeTakeFirst();
  }

  // Try character fuzzy matching filter
  const characterImage = await kysely
    .selectFrom("Image")
    .selectAll()
    .where("character", "like", `%${options.character}%`)
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .executeTakeFirst();

  // If found, return it; otherwise return null
  return characterImage || null;
};

export const getImages = async (options?: GetImagesParams) => {
  const kysely = await getKysely();
  const page = Number(options?.page) || 1;
  const limit = Number(options?.limit) || DEFAULT_CARD_PAGE_SIZE;
  const offset = (page - 1) * limit;

  // Build base queries
  let imagesQuery = kysely.selectFrom("Image").selectAll();

  let countQuery = kysely
    .selectFrom("Image")
    .select(({ fn }) => [fn.count("id").as("total")]);

  // Add character filter if provided
  if (options?.character) {
    imagesQuery = imagesQuery.where("character", "=", options.character);
    countQuery = countQuery.where("character", "=", options.character);
  }

  if (options?.orderBy) {
    imagesQuery = imagesQuery.orderBy(options.orderBy, options.direction);
  }

  const [images, totalCountResult] = await Promise.all([
    imagesQuery.limit(limit).offset(offset).execute(),
    countQuery.executeTakeFirstOrThrow(),
  ]);

  return {
    images,
    pagination: {
      page,
      limit,
      total: Number(totalCountResult.total),
      totalPages: Math.ceil(Number(totalCountResult.total) / limit),
    },
  };
};

export const createImage = async (params: CreateImageParams) => {
  const kysely = await getKysely();

  const id = crypto.randomUUID();

  const image = await kysely
    .insertInto("Image")
    .values({
      id,
      ...params,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  return image;
};

export const upsertImage = async (params: CreateImageParams) => {
  const kysely = await getKysely();

  const now = new Date().getTime();

  // If there's no ID provided, create a new one
  const id = params.id || crypto.randomUUID();

  const image = await kysely
    .insertInto("Image")
    .values({
      id,
      ...params,
      createdAt: now,
      updatedAt: now,
    })
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        ...params,
        updatedAt: now,
      }),
    )
    .returning("id")
    .executeTakeFirstOrThrow();

  return image;
};

export const updateImageTagsById = ac
  .inputSchema(UpdateImageTagsByIdSchema)
  .action(async ({ parsedInput }) => {
    const kysely = await getKysely();

    const now = new Date().getTime();

    await kysely
      .updateTable("Image")
      .set({
        ...parsedInput,
        updatedAt: now,
      })
      .where("id", "=", parsedInput.id)
      .execute();
  });

export const deleteImageById = ac
  .inputSchema(z.string().nonempty())
  .action(async ({ parsedInput }) => {
    const kysely = await getKysely();

    await kysely.deleteFrom("Image").where("id", "=", parsedInput).execute();

    revalidatePath("/");
  });

export const getImageById = async (id: string) => {
  const kysely = await getKysely();

  return await kysely
    .selectFrom("Image")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
};

export const getImageAllCharacter = ac.action(async () => {
  const kysely = await getKysely();

  const results = await kysely
    .selectFrom("Image")
    .select("character")
    .where("character", "is not", null)
    .distinct()
    .execute();

  return results
    .map((row) => row.character)
    .filter((character): character is string => character !== null);
});
