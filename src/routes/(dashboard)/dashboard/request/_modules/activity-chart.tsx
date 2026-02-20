import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";

import { Route as IndexRoute } from "../index";

function Chart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      <div className="flex h-20 items-end gap-px">
        {data.map((d) => {
          const pct = Math.max((d.count / max) * 100, d.count > 0 ? 2 : 0);
          return (
            <div
              key={d.date}
              className="flex-1 rounded-t-sm bg-primary/70 transition-all"
              style={{ height: `${pct}%` }}
              title={`${d.date}: ${d.count} requests`}
            />
          );
        })}
      </div>

      <div className="flex gap-px">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 text-center">
            {i % 2 === 0 && (
              <span className="text-[9px] text-muted-foreground">
                {d.date.slice(5)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ActivityChart() {
  const { stats } = IndexRoute.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Requests per day — last 14 days</CardDescription>
      </CardHeader>

      <CardPanel>
        <Chart data={stats.daily} />
      </CardPanel>
    </Card>
  );
}
