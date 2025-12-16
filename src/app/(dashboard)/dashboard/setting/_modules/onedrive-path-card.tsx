"use client";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Input,
} from "@libnyanpasu/material-design-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { UpsertOnedrivePathSetting } from "@/actions/query/schema";
import { upsertOnedrivePathSetting } from "@/actions/query/setting";

export const OnedrivePathCard = ({
  defaultValues,
}: {
  defaultValues: UpsertOnedrivePathSetting | null;
}) => {
  const { isPending, executeAsync, result } = useAction(
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

          const result = await executeAsync({
            path: formData.get("path") as string,
          });

          if (result.serverError) {
            toast.error(result.serverError);
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

          {result.validationErrors?.path && (
            <p>{result.validationErrors?.path._errors?.join(", ")}</p>
          )}
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
