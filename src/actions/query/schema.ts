import { z } from "zod";
import { ImageSchema } from "@/schema";

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
