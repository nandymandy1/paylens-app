import { describe, expect, it } from "vitest";
import { getSafePostAuthRedirect } from "@/utils/auth-redirect";

describe("getSafePostAuthRedirect", () => {
  it("preserves dashboard and explicit onboarding destinations", () => {
    expect(getSafePostAuthRedirect("/dashboard/members")).toBe("/dashboard/members");
    expect(getSafePostAuthRedirect("/dashboard")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/auth/select-organization")).toBe("/auth/select-organization");
    expect(getSafePostAuthRedirect("/auth/onboarding/organization")).toBe(
      "/auth/onboarding/organization",
    );
  });

  it("rejects external and unsafe targets", () => {
    expect(getSafePostAuthRedirect("https://evil.example")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("//evil.example")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("javascript:alert(1)")).toBe("/dashboard");
    expect(getSafePostAuthRedirect(null)).toBe("/dashboard");
  });

  it("rejects authentication entry pages", () => {
    expect(getSafePostAuthRedirect("/auth/login")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/auth/login?redirect_to=/dashboard/members")).toBe(
      "/dashboard/members",
    );
    expect(getSafePostAuthRedirect("/auth/register")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/auth/forgot-password")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/auth/reset-password")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/auth/verify-email")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/auth/callback")).toBe("/dashboard");
  });

  it("unwraps nested login redirects instead of looping", () => {
    expect(
      getSafePostAuthRedirect("/auth/login?redirect_to=/auth/login?redirect_to=/dashboard"),
    ).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/auth/login?redirect_to=/auth/login")).toBe("/dashboard");
  });

  it("rejects non-application paths", () => {
    expect(getSafePostAuthRedirect("/showcase")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/home")).toBe("/dashboard");
  });
});
