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
import { upsertOnedriveSetting } from "@/actions/query/setting";
import { OnedriveConfig } from "@/lib/onedrive";

export const OnedriveCard = ({
  defaultValues,
}: {
  defaultValues: OnedriveConfig | null;
}) => {
  const { isPending, executeAsync, result } = useAction(upsertOnedriveSetting);

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

          const result = await executeAsync({
            clientID: formData.get("clientID") as string,
            clientSecret: formData.get("clientSecret") as string,
            tenantID: formData.get("tenantID") as string,
            userEmail: formData.get("userEmail") as string,
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
            label="Client ID"
            name="clientID"
            defaultValue={defaultValues?.clientID}
          />

          {result.validationErrors?.clientID && (
            <p>{result.validationErrors?.clientID._errors?.join(", ")}</p>
          )}

          <Input
            type="text"
            label="Client Secret"
            name="clientSecret"
            defaultValue={defaultValues?.clientSecret}
          />

          {result.validationErrors?.clientSecret && (
            <p>{result.validationErrors?.clientSecret._errors?.join(", ")}</p>
          )}

          <Input
            type="text"
            label="Tenant ID"
            name="tenantID"
            defaultValue={defaultValues?.tenantID}
          />

          {result.validationErrors?.tenantID && (
            <p>{result.validationErrors?.tenantID._errors?.join(", ")}</p>
          )}

          <Input
            type="email"
            label="User Email"
            name="userEmail"
            defaultValue={defaultValues?.userEmail}
          />

          {result.validationErrors?.userEmail && (
            <p>{result.validationErrors?.userEmail._errors?.join(", ")}</p>
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
