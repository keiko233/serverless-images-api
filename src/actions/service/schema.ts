import { z } from "zod";

export const ImageUploadSchema = z.object({
  size: z.number().readonly(),
  name: z.string().readonly(),
  type: z.string().readonly(),
  arrayBuffer: z.instanceof(ArrayBuffer),
});

export type ImageUploadParams = z.infer<typeof ImageUploadSchema>;