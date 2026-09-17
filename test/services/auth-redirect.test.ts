import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "@/services/auth.service";

describe("getSafeRedirectPath", () => {
  it("preserves internal destinations", () => {
    expect(getSafeRedirectPath("/dashboard/members")).toBe("/dashboard/members");
    expect(getSafeRedirectPath("/select-organization")).toBe("/select-organization");
  });

  it("rejects external and unsafe targets", () => {
    expect(getSafeRedirectPath("https://evil.example")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.example")).toBe("/dashboard");
    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
  });
});
