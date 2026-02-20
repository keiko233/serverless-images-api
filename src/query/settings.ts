import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  SETTING_LEGACY_USER_AGENT_KEY,
  SETTING_ONEDRIVE_KEY,
  SETTING_ONEDRIVE_PATH_KEY,
} from "@/consts";
import { getKysely } from "@/lib/kysely";
import { OnedriveConfigSchema, type OnedriveConfig } from "@/lib/onedrive";

import {
  UpsertLegacyUserAgentSettingSchema,
  UpsertOnedrivePathSettingSchema,
  type UpsertLegacyUserAgentSetting,
} from "./schema";

export const getOnedriveSetting = createServerFn({
  method: "GET",
})
  .inputValidator(
    z
      .object({
        withRaw: z.boolean().optional().default(false),
      })
      .partial()
      .default({}),
  )
  .handler(async ({ data: { withRaw } }) => {
    const kysely = getKysely();

    const result = await kysely
      .selectFrom("Setting")
      .where("key", "==", SETTING_ONEDRIVE_KEY)
      .selectAll()
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    const parsed = JSON.parse(result.value) as OnedriveConfig | null;

    if (!parsed) {
      return null;
    }

    return {
      ...parsed,
      raw: withRaw ? result : undefined,
    };
  });

export const upsertOnedriveSetting = createServerFn({
  method: "POST",
})
  .inputValidator(OnedriveConfigSchema)
  .handler(async ({ data }) => {
    const kysely = getKysely();

    const value = JSON.stringify(data);

    const id = crypto.randomUUID();

    const result = await kysely
      .insertInto("Setting")
      .values({
        id,
        key: SETTING_ONEDRIVE_KEY,
        value,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      })
      .onConflict((oc) => oc.column("key").doUpdateSet({ value }))
      .returning("id")
      .executeTakeFirstOrThrow();

    return result;
  });

export const getOnedrivePathSetting = createServerFn({
  method: "GET",
}).handler(async () => {
  const kysely = getKysely();

  const result = await kysely
    .selectFrom("Setting")
    .where("key", "==", SETTING_ONEDRIVE_PATH_KEY)
    .selectAll()
    .executeTakeFirst();

  if (!result) {
    return null;
  }

  return result;
});

export const upsertOnedrivePathSetting = createServerFn({
  method: "POST",
})
  .inputValidator(UpsertOnedrivePathSettingSchema)
  .handler(async ({ data }) => {
    const kysely = getKysely();

    const id = crypto.randomUUID();

    const result = await kysely
      .insertInto("Setting")
      .values({
        id,
        key: SETTING_ONEDRIVE_PATH_KEY,
        value: data.path,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      })
      .onConflict((oc) =>
        oc.column("key").doUpdateSet({
          value: data.path,
        }),
      )
      .returning("id")
      .executeTakeFirstOrThrow();

    return result;
  });

export const getLegacyUserAgentSetting = createServerFn({
  method: "GET",
}).handler(async () => {
  const kysely = getKysely();

  const result = await kysely
    .selectFrom("Setting")
    .where("key", "==", SETTING_LEGACY_USER_AGENT_KEY)
    .selectAll()
    .executeTakeFirst();

  if (!result) {
    return null;
  }

  const value = JSON.parse(result.value) as UpsertLegacyUserAgentSetting;

  return {
    ...result,
    value,
  };
});

export const upsertLegacyUserAgentSetting = createServerFn({
  method: "POST",
})
  .inputValidator(UpsertLegacyUserAgentSettingSchema)
  .handler(async ({ data }) => {
    const kysely = getKysely();

    const id = crypto.randomUUID();
    const value = JSON.stringify(data);

    const result = await kysely
      .insertInto("Setting")
      .values({
        id,
        key: SETTING_LEGACY_USER_AGENT_KEY,
        value,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      })
      .onConflict((oc) => oc.column("key").doUpdateSet({ value }))
      .returning("id")
      .executeTakeFirstOrThrow();

    return result;
  });
