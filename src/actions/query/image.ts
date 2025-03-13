"use server";

import { sql } from "kysely";
import { DEFAULT_CARD_PAGE_SIZE } from "@/consts";
import { getKysely } from "@/lib/kysely";
import { CreateImageParams } from "./schema";

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

export const getImages = async (options?: {
  page?: number;
  limit?: number;
}) => {
  const kysely = await getKysely();
  const page = Number(options?.page) || 1;
  const limit = Number(options?.limit) || DEFAULT_CARD_PAGE_SIZE;
  const offset = (page - 1) * limit;

  // Build base queries
  const imagesQuery = kysely
    .selectFrom("Image")
    .selectAll()
    .orderBy("updatedAt", "desc");

  const countQuery = kysely
    .selectFrom("Image")
    .select(({ fn }) => [fn.count("id").as("total")]);

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

export const deleteImageById = async (id: string) => {
  const kysely = await getKysely();

  await kysely.deleteFrom("Image").where("id", "=", id).execute();
};

export const getImageById = async (id: string) => {
  const kysely = await getKysely();

  return await kysely
    .selectFrom("Image")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
};
