"use server";

import {
  SETTING_LEGACY_USER_AGENT_KEY,
  SETTING_ONEDRIVE_KEY,
  SETTING_ONEDRIVE_PATH_KEY,
} from "@/consts";
import { getKysely } from "@/lib/kysely";
import { OnedriveConfig, OnedriveConfigSchema } from "@/lib/onedrive";
import { ac } from "@/lib/safe-action";
import {
  UpsertLegacyUserAgentSetting,
  UpsertLegacyUserAgentSettingSchema,
  UpsertOnedrivePathSettingSchema,
} from "./schema";

export const getOnedriveSetting = async (options?: { withRaw?: boolean }) => {
  const withRaw = options?.withRaw;

  const kysely = await getKysely();

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
};

export const upsertOnedriveSetting = ac
  .inputSchema(OnedriveConfigSchema)
  .action(async ({ parsedInput }) => {
    const kysely = await getKysely();

    const value = JSON.stringify(parsedInput);

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

export const getOnedrivePathSetting = async () => {
  const kysely = await getKysely();

  const result = await kysely
    .selectFrom("Setting")
    .where("key", "==", SETTING_ONEDRIVE_PATH_KEY)
    .selectAll()
    .executeTakeFirst();

  if (!result) {
    return null;
  }

  return result;
};

export const upsertOnedrivePathSetting = ac
  .inputSchema(UpsertOnedrivePathSettingSchema)
  .action(async ({ parsedInput }) => {
    const kysely = await getKysely();

    const id = crypto.randomUUID();

    const result = await kysely
      .insertInto("Setting")
      .values({
        id,
        key: SETTING_ONEDRIVE_PATH_KEY,
        value: parsedInput.path,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      })
      .onConflict((oc) =>
        oc.column("key").doUpdateSet({ value: parsedInput.path }),
      )
      .returning("id")
      .executeTakeFirstOrThrow();

    return result;
  });

export const getLegacyUserAgentSetting = async () => {
  const kysely = await getKysely();

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
};

export const upsertLegacyUserAgentSetting = ac
  .inputSchema(UpsertLegacyUserAgentSettingSchema)
  .action(async ({ parsedInput }) => {
    const kysely = await getKysely();

    const id = crypto.randomUUID();

    const value = JSON.stringify(parsedInput);

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
