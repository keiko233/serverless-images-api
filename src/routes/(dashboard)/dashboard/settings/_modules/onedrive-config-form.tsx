import { useForm } from "@tanstack/react-form-start";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
} from "@/components/ui/card";
import { FieldWrapper, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { OnedriveConfigSchema } from "@/lib/onedrive";
import { upsertOnedriveSetting } from "@/query/settings";

import { Route as IndexRoute } from "../index";

export default function OnedriveConfigForm() {
  const { onedrive } = IndexRoute.useLoaderData();

  const form = useForm({
    defaultValues: {
      clientID: onedrive?.clientID ?? "",
      clientSecret: onedrive?.clientSecret ?? "",
      tenantID: onedrive?.tenantID ?? "",
      userEmail: onedrive?.userEmail ?? "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = OnedriveConfigSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues[0].message;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await upsertOnedriveSetting({ data: value });
    },
  });

  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle>OneDrive Configuration</CardTitle>

        <CardDescription>
          Configure Microsoft Azure app credentials to enable OneDrive access.
        </CardDescription>
      </CardHeader>

      <CardPanel
        render={
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          />
        }
      >
        <form.Field
          name="clientID"
          validators={{
            onChange: ({ value }) => {
              const result = z
                .string()
                .min(1, "Client ID is required")
                .safeParse(value);
              return result.success
                ? undefined
                : result.error.issues[0].message;
            },
          }}
        >
          {(field) => (
            <FieldWrapper
              label="Client ID"
              description="The Application (client) ID from your Azure app registration."
            >
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </FieldWrapper>
          )}
        </form.Field>

        <form.Field
          name="clientSecret"
          validators={{
            onChange: ({ value }) => {
              const result = z
                .string()
                .min(1, "Client Secret is required")
                .safeParse(value);
              return result.success
                ? undefined
                : result.error.issues[0].message;
            },
          }}
        >
          {(field) => (
            <FieldWrapper
              label="Client Secret"
              description="The client secret value from your Azure app registration."
            >
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                placeholder="•••••••••••••••••••"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </FieldWrapper>
          )}
        </form.Field>

        <form.Field
          name="tenantID"
          validators={{
            onChange: ({ value }) => {
              const result = z
                .string()
                .min(1, "Tenant ID is required")
                .safeParse(value);
              return result.success
                ? undefined
                : result.error.issues[0].message;
            },
          }}
        >
          {(field) => (
            <FieldWrapper
              label="Tenant ID"
              description="The Directory (tenant) ID of your Azure Active Directory."
            >
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </FieldWrapper>
          )}
        </form.Field>

        <form.Field
          name="userEmail"
          validators={{
            onChange: ({ value }) => {
              const result = z
                .email({ error: "Must be a valid email address" })
                .safeParse(value);
              return result.success
                ? undefined
                : result.error.issues[0].message;
            },
          }}
        >
          {(field) => (
            <FieldWrapper
              label="User Email"
              description="The Microsoft account email used to access OneDrive."
            >
              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                placeholder="user@example.com"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </FieldWrapper>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting && <Spinner className="size-4" />}
                Save Credentials
              </Button>
            </div>
          )}
        </form.Subscribe>
      </CardPanel>
    </Card>
  );
}
