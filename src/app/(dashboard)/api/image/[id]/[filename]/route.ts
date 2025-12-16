import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/actions/service/onedrive";
import { getSession } from "@/lib/auth";
import { fetchWithRetry } from "@/utils/retry";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> },
) {
  const session = await getSession();

  if (!session) {
    return new NextResponse("", { status: 404 });
  }

  const { id, filename } = await params;

  if (!id || !filename) {
    return new NextResponse("", { status: 404 });
  }

  const [url, error] = await getFile({ id, filename });

  if (error) {
    console.error(error);
    return new Response("", { status: 404 });
  }

  const imageRes = await fetchWithRetry(url);

  if (!imageRes.ok) {
    return new NextResponse("", { status: 404 });
  }

  const [, format] = filename.split(".");

  return new Response(imageRes.body, {
    headers: {
      "content-type": imageRes.headers.get("content-type") || "image/" + format,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
