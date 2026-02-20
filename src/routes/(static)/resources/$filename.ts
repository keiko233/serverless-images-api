import { createFileRoute } from "@tanstack/react-router";

import { getImageById } from "@/query/images";
import { getFile } from "@/service/onedrive";
import { fetchWithRetry } from "@/utils/retry";

export const Route = createFileRoute("/(static)/resources/$filename")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const [id, format] = params.filename.split(".");

        const query = await getImageById(id);

        if (!query) {
          return new Response(null, {
            status: 404,
          });
        }

        const result = await getFile({
          data: query,
        });

        const res = await fetchWithRetry(result);

        const buffer = await res.arrayBuffer();

        return new Response(buffer, {
          headers: {
            "content-type":
              res.headers.get("content-type") || "image/" + format,
            "Cache-Control": "public, max-age=86400, immutable",
          },
        });
      },
    },
  },
});
