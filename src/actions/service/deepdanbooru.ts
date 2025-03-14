"use server";

import { revalidatePath } from "next/cache";
import { createServerAction } from "zsa";
import { DeepDanbooru } from "@/lib/deepdanbooru";
import { ImageSchema } from "@/schema";
import { formatError } from "@/utils/fmt";
import { fetchWithRetry } from "@/utils/retry";
import { updateImageTagsById } from "../query/image";
import { getFile } from "./onedrive";

export const updateImageTags = createServerAction()
  .input(ImageSchema.pick({ id: true, filename: true }))
  .handler(async ({ input }) => {
    const [url, error] = await getFile(input);

    if (error) {
      throw new Error(formatError(error));
    }

    const res = await fetchWithRetry(url);

    const buffer = await res.arrayBuffer();

    const deepDanbooru = new DeepDanbooru(new Blob([buffer]));

    const { tags, character } = await deepDanbooru.getTag();

    await updateImageTagsById({
      id: input.id,
      character: character?.name ?? null,
      aliases: character?.words?.join(",") ?? null,
      tags: tags.map(({ tag }) => tag).join(",") ?? null,
    });

    revalidatePath("/");
  });
