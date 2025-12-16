"use server";

import { revalidatePath } from "next/cache";
import { ac } from "@/lib/safe-action";
import { upsertImage } from "../query/image";
import { uploadFile } from "./onedrive";
import { ImageUploadSchema } from "./schema";

export const uploadImage = ac
  .inputSchema(ImageUploadSchema)
  .action(async ({ parsedInput }) => {
    const { name, size, arrayBuffer } = parsedInput;

    const [, format] = name.split(".");

    const { id } = await upsertImage({
      filename: name,
      size,
    });

    await uploadFile(Buffer.from(arrayBuffer), `${id}.${format}`);

    revalidatePath("/");

    return { success: true, id };
  });
