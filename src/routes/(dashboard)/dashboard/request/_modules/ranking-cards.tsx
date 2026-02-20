import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";

import { Route as IndexRoute } from "../index";

function RankRow({
  rank,
  label,
  count,
  max,
}: {
  rank: number;
  label: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="w-4 shrink-0 text-right text-[11px] text-muted-foreground">
        {rank}
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between">
          <span className="truncate font-mono text-xs" title={label}>
            {label || "—"}
          </span>

          <span className="ml-2 shrink-0 text-xs text-muted-foreground">
            {count.toLocaleString("en-US")}
          </span>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/70 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RankingCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  const max = items[0]?.count ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>

      <CardPanel>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <RankRow
                key={item.label}
                rank={i + 1}
                label={item.label}
                count={item.count}
                max={max}
              />
            ))}
          </div>
        )}
      </CardPanel>
    </Card>
  );
}

export default function RankingCards() {
  const { stats } = IndexRoute.useLoaderData();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <RankingCard
        title="Top IPs"
        items={stats.topIps.map((r) => ({ label: r.ip, count: r.count }))}
      />

      <RankingCard
        title="Top Endpoints"
        items={stats.topEndpoints.map((r) => ({
          label: r.endpoint,
          count: r.count,
        }))}
      />

      <RankingCard
        title="Top Countries"
        items={stats.topCountries.map((r) => ({
          label: r.country,
          count: r.count,
        }))}
      />
    </div>
  );
}
