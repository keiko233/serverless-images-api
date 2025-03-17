import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getImage } from "@/actions/query/image";
import { getLegacyUserAgentSetting } from "@/actions/query/setting";
import { getFile } from "@/actions/service/onedrive";
import { Image } from "@/schema";
import { formatError } from "@/utils/fmt";
import { fetchWithRetry } from "@/utils/retry";

export const runtime = "edge";

enum Method {
  JSON = "json",
  Base64 = "base",
}

const SearchParamsSchema = z.object({
  method: z.nativeEnum(Method).nullable(),
  character: z.string().nullable(),
});

const getImageProxyUrl = (request: NextRequest, query: Image) => {
  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

  const [, format] = query.filename.split(".");

  const path = `/resources/${query.id}.${format}`;

  const url = `${baseUrl}${path}`;

  return [url, path];
};

const checkLegacyAPI = async (request: NextRequest) => {
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const { method, character } = SearchParamsSchema.parse({
      method: searchParams.get("method") || searchParams.get("m"),
      character: searchParams.get("character") || searchParams.get("p"),
    });

    const query = await getImage({
      character: character ?? undefined,
    });

    if (!query) {
      throw new Error("No image found");
    }

    // return base64 image
    if (method === Method.Base64) {
      const [url, error] = await getFile(query);

      if (error) {
        return new NextResponse(
          JSON.stringify({
            message: "Failed to get image",
            code: 400,
          }),
          {
            status: 400,
            headers: {
              "content-type": "application/json",
            },
          },
        );
      }

      const res = await fetchWithRetry(url);
      const arrayBuffer = await res.arrayBuffer();

      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const contentType = res.headers.get("content-type") || "image/png";
      const dataUrl = `data:${contentType};base64,${base64}`;

      return new NextResponse(dataUrl);
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

      return new NextResponse(JSON.stringify(response), {
        headers: {
          "content-type": "application/json",
        },
      });
    }

    // redirect to image URL
    return NextResponse.redirect(url);
  } catch (error) {
    const message = {
      message: formatError(error),
      code: 400,
    };

    return new NextResponse(JSON.stringify(message), {
      status: message.code,
      headers: {
        "content-type": "application/json",
      },
    });
  }
}
