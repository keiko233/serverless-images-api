import { describe, expect, it } from "vitest";
import { z } from "zod";

import { formatError } from "./fmt";

describe("formatError", () => {
  it("returns the message from a standard error", () => {
    expect(formatError(new Error("upload failed"))).toBe("upload failed");
  });

  it("formats validation issues with their paths", () => {
    const result = z.object({ filename: z.string() }).safeParse({
      filename: 42,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatError(result.error)).toContain("filename:");
    }
  });

  it("converts non-error values to strings", () => {
    expect(formatError("unknown failure")).toBe("unknown failure");
  });
});
