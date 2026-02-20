import type { PropsWithChildren } from "react";

export function FieldError({ errors }: { errors: unknown[] }) {
  const message = errors
    .map((e) =>
      typeof e === "string"
        ? e
        : e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : undefined,
    )
    .filter(Boolean)[0];

  if (!message) return null;
  return <p className="text-destructive text-xs">{message}</p>;
}

export function FieldWrapper({
  label,
  description,
  children,
}: PropsWithChildren<{
  label: string;
  description?: string;
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm leading-none font-medium">{label}</label>

      {description && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}

      {children}
    </div>
  );
}
