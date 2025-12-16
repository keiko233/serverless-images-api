import { NextResponse } from "next/server";
import { getImageAllCharacter } from "@/actions/query/image";

export async function GET() {
  const result = await getImageAllCharacter();

  if (result.serverError) {
    return new NextResponse(
      JSON.stringify({
        error: result.serverError,
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }

  return new NextResponse(JSON.stringify(result.data), {
    headers: {
      "content-type": "application/json",
    },
  });
}
