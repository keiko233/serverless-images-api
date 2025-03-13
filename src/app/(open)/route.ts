import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getImage } from "@/actions/query/image";
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
});

const getImageProxyUrl = (request: NextRequest, query: Image) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const [, format] = query.filename.split(".");

  return `${baseUrl}/resources/${query.id}.${format}`;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const { method } = SearchParamsSchema.parse({
      method: searchParams.get("method") || searchParams.get("m"),
    });

    const query = await getImage();

    if (!query) {
      throw new Error("No image found");
    }

    // return json object
    if (method === Method.JSON) {
      return new NextResponse(
        JSON.stringify({
          id: query.id,
          url: getImageProxyUrl(request, query),
          size: query.size,
          character: query.character,
          aliases: query.aliases,
          tags: query.tags,
        }),
        {
          headers: {
            "content-type": "application/json",
          },
        },
      );
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

    // redirect to image URL
    return NextResponse.redirect(getImageProxyUrl(request, query));
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
