import { useNavigate } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { deleteOldRequests } from "@/query/requests";
import { formatError } from "@/utils/fmt";

import { Route as IndexRoute } from "../index";

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
];

export default function CleanupCard() {
  const navigate = useNavigate({ from: IndexRoute.fullPath });

  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const customDays = parseInt(customInput, 10);
  const hasCustom = customInput !== "" && !isNaN(customDays) && customDays > 0;
  const activeDays = hasCustom ? customDays : selectedDays;

  async function handleDelete() {
    if (!activeDays || activeDays < 1) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await deleteOldRequests({ data: { days: activeDays } });
      setResult(`Deleted ${res.deleted} records.`);
      navigate({ search: (prev) => ({ ...prev, page: 1 }) });
    } catch (err) {
      setResult(`Error: ${formatError(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clean Up Logs</CardTitle>
        <CardDescription>
          Permanently delete request records older than a selected period. This
          action cannot be undone.
        </CardDescription>
      </CardHeader>

      <CardPanel>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.days}
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => {
                setSelectedDays(preset.days);
                setCustomInput("");
                setResult(null);
              }}
              className={
                selectedDays === preset.days && !hasCustom
                  ? "border-destructive text-destructive"
                  : ""
              }
            >
              {preset.label}
            </Button>
          ))}

          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              size="sm"
              placeholder="Custom days"
              value={customInput}
              className="w-28"
              onChange={(e) => {
                setCustomInput(e.target.value);
                setSelectedDays(null);
                setResult(null);
              }}
            />

            <span className="text-sm text-muted-foreground">days</span>
          </div>
        </div>
      </CardPanel>

      <CardFooter className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {result ??
            (activeDays != null
              ? `Will delete records older than ${activeDays} day${activeDays !== 1 ? "s" : ""}.`
              : "Select a time range above.")}
        </span>

        <Button
          variant="destructive"
          size="sm"
          disabled={loading || activeDays == null}
          onClick={handleDelete}
        >
          {loading ? <Spinner className="size-4" /> : <Trash2Icon />}
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
