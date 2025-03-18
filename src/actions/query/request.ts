"use server";

import { createServerAction } from "zsa";
import { DEFAULT_PAGE_SIZE } from "@/consts";
import { getKysely } from "@/lib/kysely";
import { GetRequestRecords } from "./schema";

export const checkAndRecordRequest = async (params: {
  ipAddress: string;
  endpoint?: string;
  userAgent?: string;
  method?: string;
}): Promise<boolean> => {
  const kysely = await getKysely();

  const id = crypto.randomUUID();

  // TODO: limit the number of requests from the same IP address
  await kysely
    .insertInto("Request")
    .values({
      id,
      ...params,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    })
    .execute();

  return true;
};

export const getRequestRecords = createServerAction()
  .input(GetRequestRecords)
  .handler(async ({ input }) => {
    const kysely = await getKysely();

    const page = Number(input?.page) || 1;
    const limit = Number(input?.limit) || DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * limit;

    const requests = await kysely
      .selectFrom("Request")
      .selectAll()
      .limit(limit)
      .offset(offset)
      .orderBy("createdAt", "desc")
      .execute();

    const count = await kysely
      .selectFrom("Request")
      .select(({ fn }) => [fn.count("id").as("total")])
      .executeTakeFirstOrThrow();

    return {
      requests,
      pagination: {
        page,
        limit,
        total: Number(count.total),
        totalPages: Math.ceil(Number(count.total) / limit),
      },
    };
  });
