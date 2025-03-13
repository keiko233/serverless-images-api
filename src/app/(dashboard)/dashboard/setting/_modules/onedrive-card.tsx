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
import { upsertOnedriveSetting } from "@/actions/query/setting";
import { OnedriveConfig } from "@/lib/onedrive";

export const OnedriveCard = ({
  defaultValues,
}: {
  defaultValues: OnedriveConfig | null;
}) => {
  const { isPending, execute, error } = useServerAction(upsertOnedriveSetting);

  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <h2>Onedrive Auth</h2>
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
            label="Client ID"
            name="clientID"
            defaultValue={defaultValues?.clientID}
          />

          {error?.fieldErrors?.clientID && (
            <p>{error?.fieldErrors?.clientID}</p>
          )}

          <Input
            type="text"
            label="Client Secret"
            name="clientSecret"
            defaultValue={defaultValues?.clientSecret}
          />

          {error?.fieldErrors?.clientSecret && (
            <p>{error?.fieldErrors?.clientSecret}</p>
          )}

          <Input
            type="text"
            label="Tenant ID"
            name="tenantID"
            defaultValue={defaultValues?.tenantID}
          />

          {error?.fieldErrors?.tenantID && (
            <p>{error?.fieldErrors?.tenantID}</p>
          )}

          <Input
            type="email"
            label="User Email"
            name="userEmail"
            defaultValue={defaultValues?.userEmail}
          />

          {error?.fieldErrors?.userEmail && (
            <p>{error?.fieldErrors?.userEmail}</p>
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
