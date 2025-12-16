"use server";

import { revalidatePath } from "next/cache";
import { DeepDanbooru } from "@/lib/deepdanbooru";
import { ac } from "@/lib/safe-action";
import { ImageSchema } from "@/schema";
import { formatError } from "@/utils/fmt";
import { fetchWithRetry } from "@/utils/retry";
import { updateImageTagsById } from "../query/image";
import { getFile } from "./onedrive";

export const updateImageTags = ac
  .inputSchema(ImageSchema.pick({ id: true, filename: true }))
  .action(async ({ parsedInput }) => {
    const result = await getFile(parsedInput);

    if (result.serverError || !result.data) {
      throw new Error(formatError(result.serverError));
    }

    const res = await fetchWithRetry(result.data);

    const buffer = await res.arrayBuffer();

    const deepDanbooru = new DeepDanbooru(new Blob([buffer]));

    const { tags, character } = await deepDanbooru.getTag();

    await updateImageTagsById({
      id: parsedInput.id,
      character: character?.name ?? null,
      aliases: character?.words?.join(",") ?? null,
      tags: tags.map(({ tag }) => tag).join(",") ?? null,
    });

    revalidatePath("/");
  });
