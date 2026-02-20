import { createServerFn } from "@tanstack/react-start";

import { DeepDanbooru } from "@/lib/deepdanbooru";
import { updateImageTagsById } from "@/query/images";
import { ImageSchema } from "@/schema";
import { fetchWithRetry } from "@/utils/retry";

import { getFile } from "./onedrive";

export const updateImageTags = createServerFn({
  method: "POST",
})
  .inputValidator(
    ImageSchema.pick({
      id: true,
      filename: true,
    }),
  )
  .handler(async ({ data }) => {
    const result = await getFile({ data });

    const res = await fetchWithRetry(result);

    const buffer = await res.arrayBuffer();

    const deepDanbooru = new DeepDanbooru(new Blob([buffer]));

    const { tags, character } = await deepDanbooru.getTag();

    await updateImageTagsById({
      data: {
        id: data.id,
        character: character?.name ?? null,
        aliases: character?.words?.join(",") ?? null,
        tags: tags.map(({ tag }) => tag).join(",") ?? null,
      },
    });
  });
