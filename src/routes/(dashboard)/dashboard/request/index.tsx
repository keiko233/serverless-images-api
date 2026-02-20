import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { getRequestRecords, getRequestStats } from "@/query/requests";

import ActivityChart from "./_modules/activity-chart";
import CleanupCard from "./_modules/cleanup-card";
import RankingCards from "./_modules/ranking-cards";
import RequestLog from "./_modules/request-log";
import StatCards from "./_modules/stat-cards";

const searchSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  search: z.string().optional().default(""),
});

export const Route = createFileRoute("/(dashboard)/dashboard/request/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    search: search.search,
  }),
  loader: async ({ deps }) => {
    const [recordsData, stats] = await Promise.all([
      getRequestRecords({
        data: {
          page: deps.page,
          search: deps.search,
        },
      }),
      getRequestStats(),
    ]);

    return {
      ...recordsData,
      stats,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <StatCards />
      <ActivityChart />
      <RankingCards />
      <RequestLog />
      <CleanupCard />
    </div>
  );
}
