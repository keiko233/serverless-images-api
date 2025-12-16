import { NextResponse } from "next/server";
import { getImageAllCharacter } from "@/actions/query/image";
import { RANDOM_CHARACTER_KEYWORD } from "@/consts";

// Compatibility with old API
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

  const characters =
    result.data?.map((item) => ({
      name: item
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ")
        .replace(/\s*\([^)]*\)/g, ""), // Remove parentheses and their content
      path: item,
    })) ?? [];

  return new NextResponse(
    JSON.stringify([
      ...characters,
      {
        name: "Random",
        path: RANDOM_CHARACTER_KEYWORD,
      },
    ]),
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
}
