import { useForm } from "@tanstack/react-form-start";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { FieldError, FieldWrapper } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { UpsertLegacyUserAgentSettingSchema } from "@/query/schema";
import { upsertLegacyUserAgentSetting } from "@/query/settings";

import { Route as IndexRoute } from "../index";

export default function UserAgentForm() {
  const { userAgent } = IndexRoute.useLoaderData();

  const form = useForm({
    defaultValues: {
      agents: userAgent?.value ?? ([] as string[]),
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = UpsertLegacyUserAgentSettingSchema.safeParse(
          value.agents,
        );
        if (!result.success) {
          return result.error.issues[0].message;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await upsertLegacyUserAgentSetting({ data: value.agents });
    },
  });

  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle>Legacy User Agents</CardTitle>
        <CardDescription>
          Requests from these user agents will receive legacy API responses.
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
          <form.Field name="agents">
            {(field) => (
              <FieldWrapper label="User Agent Strings">
                <div className="flex flex-col gap-2">
                  {field.state.value.length === 0 && (
                    <p className="text-muted-foreground text-sm py-1">
                      No user agents configured.
                    </p>
                  )}

                  {field.state.value.map((_, i) => (
                    <form.Field
                      key={i}
                      name={`agents[${i}]`}
                      validators={{
                        onChange: ({ value }) => {
                          const result = z
                            .string()
                            .min(1, "Cannot be empty")
                            .safeParse(value);
                          return result.success
                            ? undefined
                            : result.error.issues[0].message;
                        },
                      }}
                    >
                      {(subField) => (
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <Input
                              id={subField.name}
                              name={subField.name}
                              value={subField.state.value}
                              placeholder="Mozilla/5.0 (compatible; ...)"
                              onBlur={subField.handleBlur}
                              onChange={(e) =>
                                subField.handleChange(e.target.value)
                              }
                            />
                            {subField.state.meta.isTouched && (
                              <FieldError errors={subField.state.meta.errors} />
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="destructive-outline"
                            size="icon"
                            aria-label="Remove user agent"
                            onClick={() => field.removeValue(i)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      )}
                    </form.Field>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() => field.pushValue("")}
                  >
                    <PlusIcon />
                    Add User Agent
                  </Button>
                </div>
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
                  Save User Agents
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </CardPanel>
    </Card>
  );
}
