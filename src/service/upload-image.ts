import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { upsertImage } from "@/query/images";

import { uploadFile } from "./onedrive";

export const uploadImageFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      size: z.number(),
      base64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const dotIndex = data.name.lastIndexOf(".");
    const format = dotIndex !== -1 ? data.name.slice(dotIndex + 1) : "jpg";

    const { id } = await upsertImage({
      filename: data.name,
      size: data.size,
    });

    const buffer = Buffer.from(data.base64, "base64");
    await uploadFile(buffer, `${id}.${format}`);

    return { id };
  });
