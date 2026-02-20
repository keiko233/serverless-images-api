import { createServerFn } from "@tanstack/react-start";
import { sql } from "kysely";
import { z } from "zod";

import { DEFAULT_CARD_PAGE_SIZE, RANDOM_CHARACTER_KEYWORD } from "@/consts";
import { getKysely } from "@/lib/kysely";

import {
  GetImagesSchema,
  UpdateImageTagsByIdSchema,
  CreateImageSchema,
} from "./schema";

export const getImage = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      character: z.string().nonempty().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const kysely = getKysely();

    // If character is "random" or not specified, return a random image
    if (!data?.character || data.character === RANDOM_CHARACTER_KEYWORD) {
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
      .where("character", "like", `%${data.character}%`)
      .orderBy(sql`RANDOM()`)
      .limit(1)
      .executeTakeFirst();

    // If found, return it; otherwise return null
    return characterImage || null;
  });

export const getImages = createServerFn({
  method: "GET",
})
  .inputValidator(GetImagesSchema)
  .handler(async ({ data }) => {
    const kysely = getKysely();
    const page = Number(data?.page) || 1;
    const limit = Number(data?.limit) || DEFAULT_CARD_PAGE_SIZE;
    const offset = (page - 1) * limit;

    // Build base queries
    let imagesQuery = kysely.selectFrom("Image").selectAll();

    let countQuery = kysely
      .selectFrom("Image")
      .select(({ fn }) => [fn.count("id").as("total")]);

    // Add character filter if provided
    if (data?.character) {
      imagesQuery = imagesQuery.where("character", "=", data.character);
      countQuery = countQuery.where("character", "=", data.character);
    }

    // Add full-text search across filename, character, tags
    if (data?.search) {
      const keyword = `%${data.search}%`;

      imagesQuery = imagesQuery.where((eb) =>
        eb.or([
          eb("filename", "like", keyword),
          eb("character", "like", keyword),
          eb("tags", "like", keyword),
        ]),
      );

      countQuery = countQuery.where((eb) =>
        eb.or([
          eb("filename", "like", keyword),
          eb("character", "like", keyword),
          eb("tags", "like", keyword),
        ]),
      );
    }

    if (data?.orderBy) {
      imagesQuery = imagesQuery.orderBy(data.orderBy, data.direction);
    } else {
      imagesQuery = imagesQuery.orderBy("createdAt", "desc");
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
  });

export const createImage = createServerFn({
  method: "POST",
})
  .inputValidator(CreateImageSchema)
  .handler(async ({ data }) => {
    const kysely = getKysely();

    const id = crypto.randomUUID();

    const image = await kysely
      .insertInto("Image")
      .values({
        id,
        ...data,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    return image;
  });

export const upsertImage = createServerFn({
  method: "POST",
})
  .inputValidator(CreateImageSchema)
  .handler(async ({ data }) => {
    const kysely = getKysely();

    const now = new Date().getTime();

    // If there's no ID provided, create a new one
    const id = data.id || crypto.randomUUID();

    const image = await kysely
      .insertInto("Image")
      .values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .onConflict((oc) =>
        oc.column("id").doUpdateSet({
          ...data,
          updatedAt: now,
        }),
      )
      .returning("id")
      .executeTakeFirstOrThrow();

    return image;
  });

export const updateImageTagsById = createServerFn({
  method: "POST",
})
  .inputValidator(UpdateImageTagsByIdSchema)
  .handler(async ({ data }) => {
    const kysely = getKysely();

    const now = new Date().getTime();

    await kysely
      .updateTable("Image")
      .set({
        ...data,
        updatedAt: now,
      })
      .where("id", "=", data.id)
      .execute();
  });

export const deleteImageById = createServerFn({
  method: "POST",
})
  .inputValidator(z.string().nonempty())
  .handler(async ({ data }) => {
    const kysely = getKysely();

    await kysely.deleteFrom("Image").where("id", "=", data).execute();
  });

export const getImageById = async (id: string) => {
  const kysely = getKysely();

  return await kysely
    .selectFrom("Image")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
};

export const getImageAllCharacter = createServerFn({
  method: "GET",
}).handler(async () => {
  const kysely = getKysely();

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
