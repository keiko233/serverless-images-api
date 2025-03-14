import { NextResponse } from "next/server";
import { getImageAllCharacter } from "@/actions/query/image";

export const runtime = "edge";

export async function GET() {
  const characters = await getImageAllCharacter();

  return new NextResponse(JSON.stringify(characters), {
    headers: {
      "content-type": "application/json",
    },
  });
}
