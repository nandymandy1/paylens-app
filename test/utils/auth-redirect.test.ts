import { describe, expect, it } from "vitest";
import { getSafePostAuthRedirect } from "@/utils/auth-redirect";

describe("getSafePostAuthRedirect", () => {
  it("preserves dashboard and explicit onboarding destinations", () => {
    expect(getSafePostAuthRedirect("/dashboard/members")).toBe("/dashboard/members");
    expect(getSafePostAuthRedirect("/dashboard")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/select-organization")).toBe("/select-organization");
    expect(getSafePostAuthRedirect("/onboarding/organization")).toBe("/onboarding/organization");
  });

  it("rejects external and unsafe targets", () => {
    expect(getSafePostAuthRedirect("https://evil.example")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("//evil.example")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("javascript:alert(1)")).toBe("/dashboard");
    expect(getSafePostAuthRedirect(null)).toBe("/dashboard");
  });

  it("rejects authentication entry pages", () => {
    expect(getSafePostAuthRedirect("/login")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/login?redirect_to=/dashboard/members")).toBe(
      "/dashboard/members",
    );
    expect(getSafePostAuthRedirect("/register")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/forgot-password")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/reset-password")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/verify-email")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/auth/callback")).toBe("/dashboard");
  });

  it("unwraps nested login redirects instead of looping", () => {
    expect(getSafePostAuthRedirect("/login?redirect_to=/login?redirect_to=/dashboard")).toBe(
      "/dashboard",
    );
    expect(getSafePostAuthRedirect("/login?redirect_to=/login")).toBe("/dashboard");
  });

  it("rejects non-application paths", () => {
    expect(getSafePostAuthRedirect("/showcase")).toBe("/dashboard");
    expect(getSafePostAuthRedirect("/home")).toBe("/dashboard");
  });
});
