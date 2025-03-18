"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";
import type { ExpressionBuilder } from "kysely";
import { createServerAction } from "zsa";
import { DEFAULT_PAGE_SIZE } from "@/consts";
import { getKysely } from "@/lib/kysely";
import { Database } from "@/schema";
import { GetRequestRecords } from "./schema";

export const checkAndRecordRequest = async (params: {
  ipAddress: string;
  endpoint?: string;
  userAgent?: string;
  method?: string;
}): Promise<boolean> => {
  const kysely = await getKysely();

  const id = crypto.randomUUID();

  const { cf } = getRequestContext();

  // TODO: limit the number of requests from the same IP address
  await kysely
    .insertInto("Request")
    .values({
      id,
      ...params,
      country: cf.country,
      city: cf.city,
      region: cf.region,
      asn: String(cf.asn),
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

    const searchCondition = (eb: ExpressionBuilder<Database, "Request">) => {
      if (!input?.search) return eb.val(true);

      const searchTerm = `%${input.search}%`;
      return eb.or([
        eb("ipAddress", "like", searchTerm),
        eb("asn", "like", searchTerm),
        eb("city", "like", searchTerm),
        eb("country", "like", searchTerm),
        eb("region", "like", searchTerm),
        eb("endpoint", "like", searchTerm),
        eb("userAgent", "like", searchTerm),
        eb("method", "like", searchTerm),
      ]);
    };

    const [requests, countResult] = await Promise.all([
      kysely
        .selectFrom("Request")
        .where(searchCondition)
        .selectAll()
        .limit(limit)
        .offset(offset)
        .orderBy("createdAt", input.direction || "desc")
        .execute(),

      kysely
        .selectFrom("Request")
        .where(searchCondition)
        .select(({ fn }) => [fn.count("id").as("total")])
        .executeTakeFirstOrThrow(),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total: Number(countResult.total),
        totalPages: Math.ceil(Number(countResult.total) / limit),
      },
    };
  });
