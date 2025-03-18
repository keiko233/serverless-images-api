"use client";

import { Button, Input } from "@libnyanpasu/material-design-react";
import MaterialSymbolsSearchRounded from "~icons/material-symbols/search-rounded";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { GetRequestParams } from "@/actions/query/schema";

export const ParamsCard = ({
  defaultParams,
}: {
  defaultParams: GetRequestParams;
}) => {
  const [value, setValue] = useState("");

  const deferredValue = useDeferredValue(value);

  return (
    <div className="flex items-center justify-between gap-2">
      <Input
        variant="outlined"
        label="Search"
        type="text"
        value={deferredValue}
        onChange={(e) => setValue(e.target.value)}
      />

      <Link
        href={{
          query: {
            ...defaultParams,
            search: value,
          },
        }}
      >
        <Button icon>
          <MaterialSymbolsSearchRounded className="size-6" />
        </Button>
      </Link>
    </div>
  );
};
