import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(static)/resources/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const baseURL = new URL(request.url).origin;
        return Response.redirect(new URL("/", baseURL));
      },
    },
  },
});
