import { z } from "zod";

export const ImageSchema = z.object({
  id: z.string(),
  filename: z.string(),
  size: z.number(),
  tags: z.string().nullable(),
  character: z.string().nullable(),
  aliases: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Image = z.infer<typeof ImageSchema>;

// not need zod schema
export interface Database {
  Image: Image;
}
