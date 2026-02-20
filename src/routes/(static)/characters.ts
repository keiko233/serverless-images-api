import { createFileRoute } from "@tanstack/react-router";

import { getImageAllCharacter } from "@/query/images";

export const Route = createFileRoute("/(static)/characters")({
  server: {
    handlers: {
      GET: async () => {
        const result = await getImageAllCharacter();

        return new Response(JSON.stringify(result), {
          headers: {
            "content-type": "application/json",
          },
        });
      },
    },
  },
});
