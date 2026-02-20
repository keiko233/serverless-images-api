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
import { upsertOnedrivePathSetting } from "@/query/settings";

import { Route as IndexRoute } from "../index";

export default function OnedrivePathForm() {
  const { onedrivePath } = IndexRoute.useLoaderData();

  const form = useForm({
    defaultValues: {
      path: onedrivePath?.value ?? "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = z
          .string()
          .min(1, "Path is required")
          .safeParse(value.path);
        if (!result.success) {
          return result.error.issues[0].message;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await upsertOnedrivePathSetting({ data: { path: value.path } });
    },
  });

  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle>Storage Path</CardTitle>
        <CardDescription>
          Set the root folder path in OneDrive where images are stored.
        </CardDescription>
      </CardHeader>

      <CardPanel>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="path"
            validators={{
              onChange: ({ value }) => {
                const result = z
                  .string()
                  .min(1, "Path is required")
                  .safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <FieldWrapper
                label="Root Path"
                description='The folder path in OneDrive where images are stored, e.g. "/images".'
              >
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  placeholder="/images"
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
                  Save Path
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </CardPanel>
    </Card>
  );
}
