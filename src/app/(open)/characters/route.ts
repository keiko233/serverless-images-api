import { NextResponse } from "next/server";
import { getImageAllCharacter } from "@/actions/query/image";

export async function GET() {
  const [characters, error] = await getImageAllCharacter();

  if (error) {
    return new NextResponse(JSON.stringify({ error }), {
      status: 500,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  return new NextResponse(JSON.stringify(characters), {
    headers: {
      "content-type": "application/json",
    },
  });
}
