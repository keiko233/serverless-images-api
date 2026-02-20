import { createServerFn } from "@tanstack/react-start";
import { sql } from "kysely";
import { z } from "zod";

import { DEFAULT_PAGE_SIZE } from "@/consts";
import { getKysely } from "@/lib/kysely";

import { GetRequestRecords } from "./schema";

export const getRequestRecords = createServerFn({
  method: "GET",
})
  .inputValidator(GetRequestRecords)
  .handler(async ({ data }) => {
    const kysely = getKysely();
    const page = Number(data?.page) || 1;
    const limit = Number(data?.limit) || DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * limit;

    let query = kysely.selectFrom("Request").selectAll();
    let countQuery = kysely
      .selectFrom("Request")
      .select(({ fn }) => [fn.count("id").as("total")]);

    if (data?.search) {
      const keyword = `%${data.search}%`;
      query = query.where((eb) =>
        eb.or([
          eb("ipAddress", "like", keyword),
          eb("endpoint", "like", keyword),
          eb("country", "like", keyword),
        ]),
      );
      countQuery = countQuery.where((eb) =>
        eb.or([
          eb("ipAddress", "like", keyword),
          eb("endpoint", "like", keyword),
          eb("country", "like", keyword),
        ]),
      );
    }

    query = query.orderBy(
      "createdAt",
      data?.direction === "asc" ? "asc" : "desc",
    );

    const [records, totalCountResult] = await Promise.all([
      query.limit(limit).offset(offset).execute(),
      countQuery.executeTakeFirstOrThrow(),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total: Number(totalCountResult.total),
        totalPages: Math.ceil(Number(totalCountResult.total) / limit),
      },
    };
  });

export const getRequestStats = createServerFn({
  method: "GET",
}).handler(async () => {
  const kysely = getKysely();
  const now = Date.now();
  const todayCutoff = now - 24 * 60 * 60 * 1000;
  const weekCutoff = now - 7 * 24 * 60 * 60 * 1000;
  const day14Cutoff = now - 14 * 24 * 60 * 60 * 1000;

  const dayGroup = sql<string>`strftime('%Y-%m-%d', datetime(createdAt/1000, 'unixepoch'))`;

  const [
    total,
    uniqueIps,
    todayCount,
    weekCount,
    topIps,
    topEndpoints,
    topCountries,
    daily,
  ] = await Promise.all([
    kysely
      .selectFrom("Request")
      .select(({ fn }) => fn.count("id").as("count"))
      .executeTakeFirstOrThrow(),

    kysely
      .selectFrom("Request")
      .select(sql<number>`COUNT(DISTINCT ipAddress)`.as("count"))
      .executeTakeFirstOrThrow(),

    kysely
      .selectFrom("Request")
      .select(({ fn }) => fn.count("id").as("count"))
      .where("createdAt", ">=", todayCutoff)
      .executeTakeFirstOrThrow(),

    kysely
      .selectFrom("Request")
      .select(({ fn }) => fn.count("id").as("count"))
      .where("createdAt", ">=", weekCutoff)
      .executeTakeFirstOrThrow(),

    kysely
      .selectFrom("Request")
      .select(["ipAddress", sql<number>`COUNT(*)`.as("count")])
      .groupBy("ipAddress")
      .orderBy(sql`COUNT(*)`, "desc")
      .limit(8)
      .execute(),

    kysely
      .selectFrom("Request")
      .where("endpoint", "is not", null)
      .select(["endpoint", sql<number>`COUNT(*)`.as("count")])
      .groupBy("endpoint")
      .orderBy(sql`COUNT(*)`, "desc")
      .limit(8)
      .execute(),

    kysely
      .selectFrom("Request")
      .where("country", "is not", null)
      .select(["country", sql<number>`COUNT(*)`.as("count")])
      .groupBy("country")
      .orderBy(sql`COUNT(*)`, "desc")
      .limit(8)
      .execute(),

    kysely
      .selectFrom("Request")
      .where("createdAt", ">=", day14Cutoff)
      .select([dayGroup.as("date"), sql<number>`COUNT(*)`.as("count")])
      .groupBy(dayGroup)
      .orderBy("date", "asc")
      .execute(),
  ]);

  // Fill in missing days so the chart always shows 14 bars
  const dailyMap = new Map(daily.map((d) => [d.date, Number(d.count)]));
  const filledDaily: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = new Date(now - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    filledDaily.push({ date: key, count: dailyMap.get(key) ?? 0 });
  }

  return {
    total: Number(total.count),
    uniqueIps: Number(uniqueIps.count),
    todayCount: Number(todayCount.count),
    weekCount: Number(weekCount.count),
    topIps: topIps.map((r) => ({ ip: r.ipAddress, count: Number(r.count) })),
    topEndpoints: topEndpoints.map((r) => ({
      endpoint: r.endpoint ?? "",
      count: Number(r.count),
    })),
    topCountries: topCountries.map((r) => ({
      country: r.country ?? "",
      count: Number(r.count),
    })),
    daily: filledDaily,
  };
});

export const deleteOldRequests = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ days: z.number().int().min(1) }))
  .handler(async ({ data }) => {
    const kysely = getKysely();
    const cutoff = Date.now() - data.days * 24 * 60 * 60 * 1000;
    const result = await kysely
      .deleteFrom("Request")
      .where("createdAt", "<", cutoff)
      .executeTakeFirst();

    return { deleted: Number(result.numDeletedRows) };
  });
