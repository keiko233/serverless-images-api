import { NextResponse } from "next/server";
import { getImageAllCharacter } from "@/actions/query/image";

export const runtime = "edge";

// Compatibility with old API
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

  return new NextResponse(
    JSON.stringify(
      characters.map((item) => ({
        name: item
          .split("_")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ")
          .replace(/\s*\([^)]*\)/g, ""), // Remove parentheses and their content
        path: item,
      })),
    ),
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
}
