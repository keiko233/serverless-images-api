"use client";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Input,
} from "@libnyanpasu/material-design-react";
import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";
import { useLockFn } from "ahooks";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { UpsertLegacyUserAgentSetting } from "@/actions/query/schema";
import { upsertLegacyUserAgentSetting } from "@/actions/query/setting";

const ValueInput = ({ onClick }: { onClick: (value: string) => void }) => {
  const [value, setValue] = useState("");

  const deferredValue = useDeferredValue(value);

  const handleClick = () => {
    if (!deferredValue) {
      toast.error("User Agent cannot be empty");
      return;
    }

    onClick(value);
    setValue("");
  };

  return (
    <Input
      type="text"
      label="New User Agent"
      value={deferredValue}
      onChange={(e) => setValue(e.target.value)}
    >
      <Button className="size-8" icon onClick={handleClick}>
        <MaterialSymbolsAdd2Rounded />
      </Button>
    </Input>
  );
};

export const UserAgentCard = ({
  defaultValues,
}: {
  defaultValues: UpsertLegacyUserAgentSetting | null;
}) => {
  const [list, setList] = useState<string[]>(defaultValues ?? []);

  const { isPending, execute } = useServerAction(upsertLegacyUserAgentSetting);

  const handleClick = useLockFn(async () => {
    const [, error] = await execute(list);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("User Agent updated");
    }
  });

  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <h2>Legacy API User Agent</h2>
      </CardHeader>

      <CardContent>
        {list.map((value, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 px-2"
          >
            <span className="truncate font-mono">{value}</span>

            <Button
              className="size-8"
              variant="stroked"
              icon
              onClick={() => {
                setList(list.filter((_, i) => i !== index));
              }}
            >
              <MaterialSymbolsCloseRounded />
            </Button>
          </div>
        ))}

        <ValueInput
          onClick={(value) => {
            setList([...list, value]);
          }}
        />
      </CardContent>

      <CardFooter>
        <Button variant="flat" loading={isPending} onClick={handleClick}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
};
