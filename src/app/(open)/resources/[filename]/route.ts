import { NextRequest, NextResponse } from "next/server";
import { getImageById } from "@/actions/query/image";
import { getFile } from "@/actions/service/onedrive";
import { fetchWithRetry } from "@/utils/retry";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  const [id, format] = filename.split(".");

  const query = await getImageById(id);

  if (!query) {
    return new NextResponse(null, {
      status: 404,
    });
  }

  const [url, error] = await getFile(query);

  if (error) {
    console.log(error);

    return new NextResponse(null, {
      status: 404,
    });
  }

  const res = await fetchWithRetry(url);

  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "content-type": res.headers.get("content-type") || "image/" + format,
    },
  });
}
