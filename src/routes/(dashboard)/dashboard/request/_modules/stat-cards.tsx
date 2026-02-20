import { Card, CardPanel } from "@/components/ui/card";

import { Route as IndexRoute } from "../index";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <Card>
      <CardPanel>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p className="text-2xl font-bold leading-none">
          {value.toLocaleString("en-US")}
        </p>

        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardPanel>
    </Card>
  );
}

export default function StatCards() {
  const { stats } = IndexRoute.useLoaderData();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Total Requests" value={stats.total} />

      <StatCard label="Unique IPs" value={stats.uniqueIps} />

      <StatCard label="Last 24 h" value={stats.todayCount} />

      <StatCard label="Last 7 Days" value={stats.weekCount} />
    </div>
  );
}
