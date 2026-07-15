import { createFileRoute } from "@tanstack/react-router";

import { getImage } from "@/query/images";
import { handler } from "@/routers/image";
import { type Image } from "@/schema";

const getImageProxyUrl = (request: Request, query: Image) => {
  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  const [, format] = query.filename.split(".");
  const path = `/resources/${query.id}.${format}`;
  return `${baseUrl}${path}`;
};

export const Route = createFileRoute("/(static)/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const method =
          url.searchParams.get("method") || url.searchParams.get("m");

        if (method) {
          const { response } = await handler.handle(request, {
            prefix: "",
            context: { request },
          });
          return response ?? new Response("Not Found", { status: 404 });
        }

        const character =
          url.searchParams.get("character") || url.searchParams.get("p");

        const query = await getImage({ data: { character } });

        if (!query) {
          return new Response(
            JSON.stringify({ message: "No image found", code: 400 }),
            {
              status: 400,
              headers: { "content-type": "application/json" },
            },
          );
        }

        const redirectUrl = getImageProxyUrl(request, query);
        return Response.redirect(redirectUrl);
      },
    },
  },
});
