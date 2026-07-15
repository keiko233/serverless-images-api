import { createFileRoute } from "@tanstack/react-router";

import { handler } from "@/routers/image";

export const Route = createFileRoute("/(static)/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { response } = await handler.handle(request, {
          prefix: "",
          context: { request },
        });

        return response ?? new Response("Not Found", { status: 404 });
      },
    },
  },
});
