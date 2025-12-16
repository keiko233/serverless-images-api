import { ZodError } from "zod";

export function formatError(err: unknown): string {
  if (err instanceof Error) {
    if (err instanceof ZodError) {
      return err.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
    }
    return err.message;
  }

  // Handle case where error might be a ZodError-like object
  if (
    err &&
    typeof err === "object" &&
    "errors" in err &&
    Array.isArray(err.errors)
  ) {
    try {
      return err.errors
        .map(
           
          (e: any) =>
            `${e.path?.join?.(".") || "unknown"}: ${e.message || "Invalid value"}`,
        )
        .join("; ");
    } catch (formatErr) {
      console.error("Error formatting ZodError-like object:", formatErr);
    }
  }

  return String(err);
}
