import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { getImage } from "@/query/images";
import { getLegacyUserAgentSetting } from "@/query/settings";
import { type Image } from "@/schema";
import { getFile } from "@/service/onedrive";
import { formatError } from "@/utils/fmt";
import { fetchWithRetry } from "@/utils/retry";

enum Method {
  JSON = "json",
  Base64 = "base",
}

const SearchParamsSchema = z.object({
  method: z.enum(Method).nullable(),
  character: z.string().nullable(),
});

const getImageProxyUrl = (request: Request, query: Image) => {
  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

  const [, format] = query.filename.split(".");

  const path = `/resources/${query.id}.${format}`;

  const url = `${baseUrl}${path}`;

  return [url, path];
};

const checkLegacyAPI = async (request: Request) => {
  const ua = request.headers.get("user-agent") || "";

  const uaList = await getLegacyUserAgentSetting();

  return (
    uaList?.value.some((pattern) => {
      try {
        const regex = new RegExp(pattern);
        const isMatch = regex.test(ua);

        return isMatch;
      } catch (e) {
        console.error(`Invalid regex pattern: ${pattern}`, e);
        return false;
      }
    }) || false
  );
};

export const Route = createFileRoute("/(static)/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { searchParams } = new URL(request.url);

        try {
          const { method, character } = SearchParamsSchema.parse({
            method: searchParams.get("method") || searchParams.get("m"),
            character: searchParams.get("character") || searchParams.get("p"),
          });

          const query = await getImage({ data: { character } });

          if (!query) {
            throw new Error("No image found");
          }

          // return base64 image
          if (method === Method.Base64) {
            const result = await getFile({
              data: query,
            });

            const res = await fetchWithRetry(result);
            const arrayBuffer = await res.arrayBuffer();

            const base64 = Buffer.from(arrayBuffer).toString("base64");
            const contentType = res.headers.get("content-type") || "image/png";
            const dataUrl = `data:${contentType};base64,${base64}`;

            return new Response(dataUrl);
          }

          const [url, path] = getImageProxyUrl(request, query);

          // return json object
          if (method === Method.JSON) {
            const useLegacyAPI = await checkLegacyAPI(request);

            const response = useLegacyAPI
              ? { response: [{ path, url }] }
              : {
                  id: query.id,
                  url,
                  size: query.size,
                  character: query.character,
                  aliases: query.aliases,
                  tags: query.tags,
                };

            return new Response(JSON.stringify(response), {
              headers: {
                "content-type": "application/json",
              },
            });
          }

          // redirect to image URL
          return Response.redirect(url);
        } catch (error) {
          const message = {
            message: formatError(error),
            code: 400,
          };

          return new Response(JSON.stringify(message), {
            status: message.code,
            headers: {
              "content-type": "application/json",
            },
          });
        }
      },
    },
  },
});
