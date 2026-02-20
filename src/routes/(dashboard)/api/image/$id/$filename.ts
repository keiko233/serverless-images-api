import { createFileRoute } from "@tanstack/react-router";

import { getSession } from "@/lib/auth-server";
import { getFile } from "@/service/onedrive";
import { fetchWithRetry } from "@/utils/retry";

export const Route = createFileRoute("/(dashboard)/api/image/$id/$filename")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const session = await getSession();

        if (!session) {
          return new Response(null, {
            status: 404,
          });
        }

        const { id, filename } = params;

        if (!id || !filename) {
          return new Response(null, {
            status: 404,
          });
        }

        const result = await getFile({
          data: {
            id,
            filename,
          },
        });

        const imageRes = await fetchWithRetry(result);

        if (!imageRes.ok) {
          return new Response(null, {
            status: 404,
          });
        }

        const [, format] = filename.split(".");

        return new Response(imageRes.body, {
          headers: {
            "content-type":
              imageRes.headers.get("content-type") || "image/" + format,
            "Cache-Control": "public, max-age=86400, immutable",
          },
        });
      },
    },
  },
});
