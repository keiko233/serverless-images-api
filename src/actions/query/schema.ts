import { z } from "zod";
import { ImageSchema, OrderByKeys } from "@/schema";

export const UpsertOnedrivePathSettingSchema = z.object({
  path: z.string().nonempty(),
});

export type UpsertOnedrivePathSetting = z.infer<
  typeof UpsertOnedrivePathSettingSchema
>;

export const CreateImageSchema = ImageSchema.extend({
  id: ImageSchema.shape.id.optional(),
}).omit({
  tags: true,
  character: true,
  aliases: true,
  updatedAt: true,
  createdAt: true,
});

export type CreateImageParams = z.infer<typeof CreateImageSchema>;

export const UpdateImageTagsByIdSchema = ImageSchema.pick({
  id: true,
  tags: true,
  character: true,
  aliases: true,
});

export type UpdateImageTagsByIdParams = z.infer<
  typeof UpdateImageTagsByIdSchema
>;

export type GetImagesUserOrderByKeys = OrderByKeys<"Image">;

export const getImagesUserOrderByFields = [
  "createdAt",
  "updatedAt",
  "tags",
  "character",
  "aliases",
] as const;

export const GetImagesSchema = z.object({
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
  character: z.string().optional(),
  orderBy: z.enum(getImagesUserOrderByFields).optional(),
  direction: z.enum(["asc", "desc"]).optional(),
});

export type GetImagesParams = z.infer<typeof GetImagesSchema>;

export const UpsertLegacyUserAgentSettingSchema = z
  .array(z.string())
  .default([]);

export type UpsertLegacyUserAgentSetting = z.infer<
  typeof UpsertLegacyUserAgentSettingSchema
>;

export const GetRequestRecords = z.object({
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
});

export type GetRequestParams = z.infer<typeof GetRequestRecords>;
