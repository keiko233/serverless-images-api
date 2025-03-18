import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@libnyanpasu/material-design-react";
import { getRequestRecords } from "@/actions/query/request";
import { GetImagesParams, GetRequestParams } from "@/actions/query/schema";
import { Pagination } from "@/components/pagination";

export const runtime = "edge";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<GetRequestParams>;
}) {
  const { page, limit } = await searchParams;

  const params: GetImagesParams = {
    page: page ? parseInt(String(page)) : undefined,
    limit: limit ? parseInt(String(limit)) : undefined,
  };

  const [result] = await getRequestRecords(params);

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>IP</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>User Agent</TableHead>
            <TableHead>Create At</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {result?.requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-mono">{request.ipAddress}</TableCell>

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

      {result && (
        <Pagination
          className="py-4"
          pagination={result.pagination}
          searchParams={params}
        />
      )}
    </div>
  );
}
