import { useNavigate } from "@tanstack/react-router";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Route as IndexRoute } from "../index";

function formatDate(value: number | string | null | undefined): string {
  if (value == null) {
    return "—";
  }

  const d = new Date(value);

  if (isNaN(d.getTime())) {
    return String(value);
  }

  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function truncate(str: string | null | undefined, max = 48): string {
  if (!str) {
    return "—";
  }

  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default function RequestLog() {
  const { records, pagination } = IndexRoute.useLoaderData();

  const search = IndexRoute.useSearch();

  const navigate = useNavigate({
    from: IndexRoute.fullPath,
  });

  const [searchInput, setSearchInput] = useState(search.search ?? "");

  function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate({
      search: (prev) => ({ ...prev, search: searchInput, page: 1 }),
    });
  }

  function handlePage(page: number) {
    navigate({ search: (prev) => ({ ...prev, page }) });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Log</CardTitle>
        <CardDescription>
          {pagination.total.toLocaleString("en-US")} records · page{" "}
          {pagination.page} of {pagination.totalPages || 1}
        </CardDescription>
      </CardHeader>

      <CardPanel>
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <Input
            type="search"
            placeholder="Search by IP, endpoint, or country…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <Button type="submit" variant="outline">
            Search
          </Button>

          {search.search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchInput("");
                navigate({
                  search: (prev) => ({ ...prev, search: "", page: 1 }),
                });
              }}
            >
              Clear
            </Button>
          )}
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP Address</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>User Agent</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs">
                    {record.ipAddress}
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-semibold uppercase">
                      {record.method ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell
                    className="max-w-[200px] truncate font-mono text-xs"
                    title={record.endpoint ?? undefined}
                  >
                    {truncate(record.endpoint, 40)}
                  </TableCell>

                  <TableCell className="text-xs">
                    {[record.country, record.region, record.city]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>

                  <TableCell
                    className="max-w-[180px] truncate text-xs text-muted-foreground"
                    title={record.userAgent ?? undefined}
                  >
                    {truncate(record.userAgent, 36)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(record.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardPanel>

      {pagination.totalPages > 1 && (
        <CardFooter className="justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePage(pagination.page - 1)}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePage(pagination.page + 1)}
          >
            Next
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
