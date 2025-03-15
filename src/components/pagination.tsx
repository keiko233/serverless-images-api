import { cn } from "@libnyanpasu/material-design-libs";
import { Button } from "@libnyanpasu/material-design-react";
import Link from "next/link";
import { ComponentProps } from "react";

export type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const Pagination = ({
  className,
  pagination,
  searchParams,
  ...props
}: ComponentProps<"div"> & {
  pagination: PaginationProps;
  searchParams?: Record<string, string | number | boolean | undefined>;
}) => {
  // Helper function to create pagination link query params
  const createPaginationLink = (targetPage: number) => {
    return {
      query: {
        ...searchParams,
        page: targetPage,
      },
    };
  };

  const prevPage = Math.max(1, pagination.page - 1);
  const nextPage = Math.min(pagination.totalPages, pagination.page + 1);

  return (
    <div
      className={cn("flex items-center justify-center gap-4", className)}
      {...props}
    >
      <Link href={createPaginationLink(prevPage)}>
        <Button variant="flat">Previous Page</Button>
      </Link>

      <p className="text-sm">
        Page: {pagination.page} / {pagination.totalPages}
      </p>

      <Link href={createPaginationLink(nextPage)}>
        <Button variant="flat">Next Page</Button>
      </Link>
    </div>
  );
};
