import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getImage } from "@/actions/query/image";
import { formatError } from "@/utils/fmt";

export const runtime = "edge";

enum Method {
  JSON = "json",
  Base64 = "base",
}

const SearchParamsSchema = z.object({
  method: z.nativeEnum(Method).nullable(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const { method } = SearchParamsSchema.parse({
      method: searchParams.get("method") || searchParams.get("m"),
    });

    const query = await getImage();

    // return base64 image
    if (method === Method.Base64) {
      return new NextResponse(JSON.stringify(query), {});
    }

    // return json object
    if (method === Method.JSON) {
      return new NextResponse(JSON.stringify(query), {
        headers: {
          "content-type": "application/json",
        },
      });
    }

    // return raw image
    return new NextResponse(JSON.stringify(query), {});
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
