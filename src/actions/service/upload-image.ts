"use server";

import { revalidatePath } from "next/cache";
import { createServerAction } from "zsa";
import { createImage } from "../query/image";
import { uploadFile } from "./onedrive";
import { ImageUploadSchema } from "./schema";

export const uploadImage = createServerAction()
  .input(ImageUploadSchema)
  .handler(async ({ input }) => {
    const { name, size, arrayBuffer } = input;

    const [, format] = name.split(".");

    const { id } = await createImage({
      filename: name,
      size,
    });

    await uploadFile(Buffer.from(arrayBuffer), `${id}.${format}`);

    revalidatePath("/");

    return { success: true, id };
  });
