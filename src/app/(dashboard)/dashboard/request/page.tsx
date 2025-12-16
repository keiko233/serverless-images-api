import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@libnyanpasu/material-design-react";
import { getRequestRecords } from "@/actions/query/request";
import { GetRequestParams } from "@/actions/query/schema";
import { Pagination } from "@/components/pagination";
import { formatError } from "@/utils/fmt";
import { ParamsCard } from "./_modules/params-card";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<GetRequestParams>;
}) {
  const { page, limit, search, direction } = await searchParams;

  const params: GetRequestParams = {
    page: page ? parseInt(String(page)) : undefined,
    limit: limit ? parseInt(String(limit)) : undefined,
    search,
    direction,
  };

  const result = await getRequestRecords(params);

  if (result.serverError || !result.data) {
    console.error(result.serverError);
    return <div>Error: {formatError(result.serverError)}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <ParamsCard defaultParams={params} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>IP</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>ASN</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>User Agent</TableHead>
            <TableHead>Create At</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {result.data.requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-mono">{request.ipAddress}</TableCell>

              <TableCell className="truncate">{request.country}</TableCell>

              <TableCell className="truncate">{request.city}</TableCell>

              <TableCell className="truncate">{request.region}</TableCell>

              <TableCell className="truncate">{request.asn}</TableCell>

              <TableCell>{request.method}</TableCell>

              <TableCell className="truncate">{request.endpoint}</TableCell>

              <TableCell className="truncate">{request.userAgent}</TableCell>

              <TableCell className="truncate">
                {new Date(request.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {result.data && (
        <Pagination
          className="py-4"
          pagination={result.data.pagination}
          searchParams={params}
        />
      )}
    </div>
  );
}
