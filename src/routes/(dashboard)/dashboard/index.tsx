import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { DEFAULT_CARD_PAGE_SIZE } from "@/consts";
import { getImages } from "@/query/images";

import ImageGrid from "./_modules/image-grid";

const searchSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  search: z.string().optional().default(""),
  pageSize: z
    .number()
    .int()
    .min(1)
    .optional()
    .default(DEFAULT_CARD_PAGE_SIZE),
});

export const Route = createFileRoute("/(dashboard)/dashboard/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    search: search.search,
    pageSize: search.pageSize,
  }),
  loader: async ({ deps }) => {
    return await getImages({
      data: {
        page: deps.page,
        search: deps.search || undefined,
        limit: deps.pageSize,
      },
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <ImageGrid />;
}
