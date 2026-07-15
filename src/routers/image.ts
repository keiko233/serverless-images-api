import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { os, onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { z } from "zod";

import { RANDOM_CHARACTER_KEYWORD } from "@/consts";
import { getImage, getImageAllCharacter } from "@/query/images";
import { getLegacyUserAgentSetting } from "@/query/settings";
import { type Image } from "@/schema";
import { getFile } from "@/service/onedrive";
import { fetchWithRetry } from "@/utils/retry";

const MethodEnum = z.enum(["json", "base"]);

type Context = {
  request: Request;
};

const getImageProxyUrl = (request: Request, query: Image) => {
  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  const [, format] = query.filename.split(".");
  const path = `/resources/${query.id}.${format}`;
  return [`${baseUrl}${path}`, path] as const;
};

const checkLegacyAPI = async (request: Request) => {
  const ua = request.headers.get("user-agent") || "";
  const uaList = await getLegacyUserAgentSetting();
  return (
    uaList?.value.some((pattern) => {
      try {
        const regex = new RegExp(pattern);
        return regex.test(ua);
      } catch (e) {
        console.error(`Invalid regex pattern: ${pattern}`, e);
        return false;
      }
    }) || false
  );
};

const getRandomImageProc = os
  .$context<Context>()
  .route({
    method: "GET",
    path: "/",
    summary: "Get a random or character-specific image",
    description:
      "Returns image info in JSON format. Supports base64 encoding via method=base.",
  })
  .input(
    z.object({
      method: MethodEnum.optional(),
      m: MethodEnum.optional(),
      character: z.string().optional(),
      p: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { request } = context;
    const method = input.method || input.m;
    const character = input.character || input.p;

    const query = await getImage({ data: { character } });

    if (!query) {
      throw new Error("No image found");
    }

    if (method === "base") {
      const result = await getFile(query);
      const res = await fetchWithRetry(result);
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const contentType = res.headers.get("content-type") || "image/png";
      return `data:${contentType};base64,${base64}`;
    }

    const [url, path] = getImageProxyUrl(request, query);
    const useLegacyAPI = await checkLegacyAPI(request);

    if (useLegacyAPI) {
      return { response: [{ path, url }] };
    }

    return {
      id: query.id,
      url,
      size: query.size,
      character: query.character,
      aliases: query.aliases,
      tags: query.tags,
    };
  });

const getCharactersProc = os
  .$context<Context>()
  .route({
    method: "GET",
    path: "/characters",
    summary: "List all image characters",
    description: "Returns a list of all available image character names.",
  })
  .handler(async () => {
    const result = await getImageAllCharacter();
    return result;
  });

const getCharactersLegacyProc = os
  .$context<Context>()
  .route({
    method: "GET",
    path: "/path",
    summary: "List image characters (legacy format)",
    description:
      "Returns a list of characters with formatted names and paths. Compatible with legacy API format.",
  })
  .handler(async () => {
    const result = await getImageAllCharacter();

    const characters =
      result?.map((item) => ({
        name: item
          .split("_")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ")
          .replace(/\s*\([^)]*\)/g, ""),
        path: item,
      })) ?? [];

    return [
      ...characters,
      {
        name: "Random",
        path: RANDOM_CHARACTER_KEYWORD,
      },
    ];
  });

export const router = os.router({
  getRandomImage: getRandomImageProc,
  getCharacters: getCharactersProc,
  getCharactersLegacy: getCharactersLegacyProc,
});

export const handler = new OpenAPIHandler(router, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "Serverless Images API",
          version: "1.0.0",
          description:
            "A serverless API for serving random or character-specific images from OneDrive storage.",
        },
      },
      docsPath: "/playground",
      specPath: "/spec.json",
      docsTitle: "Serverless Images API",
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
