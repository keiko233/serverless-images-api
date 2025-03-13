"use client";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Input,
} from "@libnyanpasu/material-design-react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { UpsertOnedrivePathSetting } from "@/actions/query/schema";
import { upsertOnedrivePathSetting } from "@/actions/query/setting";

export const OnedrivePathCard = ({
  defaultValues,
}: {
  defaultValues: UpsertOnedrivePathSetting | null;
}) => {
  const { isPending, execute, error } = useServerAction(
    upsertOnedrivePathSetting,
  );

  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <h2>Onedrive Upload Path</h2>
      </CardHeader>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;

          const formData = new FormData(form);

          const [, err] = await execute(formData);

          if (err) {
            // handle error
            return;
          }

          toast.success("Successfully saved");
        }}
      >
        <CardContent>
          <Input
            type="text"
            label="Path (eg: /mydir/picture)"
            name="path"
            defaultValue={defaultValues?.path}
          />

          {error?.fieldErrors?.path && <p>{error?.fieldErrors?.path}</p>}
        </CardContent>

        <CardFooter>
          <Button type="submit" variant="flat" loading={isPending}>
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
