import { createFileRoute } from "@tanstack/react-router";

import { RANDOM_CHARACTER_KEYWORD } from "@/consts";
import { getImageAllCharacter } from "@/query/images";

// Compatibility with old API
export const Route = createFileRoute("/(static)/path")({
  server: {
    handlers: {
      GET: async () => {
        const result = await getImageAllCharacter();

        const characters =
          result?.map((item) => ({
            name: item
              .split("_")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
              )
              .join(" ")
              .replace(/\s*\([^)]*\)/g, ""), // Remove parentheses and their content
            path: item,
          })) ?? [];

        return new Response(
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
      },
    },
  },
});
