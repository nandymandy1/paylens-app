import { describe, expect, it } from "vitest";
import { getSafeInternalPath, isRouteActive } from "@/utils/navigation";

describe("isRouteActive", () => {
  it("matches exact only for the dashboard root", () => {
    expect(isRouteActive("/dashboard", "/dashboard", "exact")).toBe(true);
    expect(isRouteActive("/dashboard/members", "/dashboard", "exact")).toBe(false);
    expect(isRouteActive("/dashboard/departments", "/dashboard", "exact")).toBe(false);
  });

  it("matches sections and nested routes without prefix collisions", () => {
    expect(isRouteActive("/dashboard/members", "/dashboard/members", "section")).toBe(true);
    expect(isRouteActive("/dashboard/members/abc", "/dashboard/members", "section")).toBe(true);
    expect(isRouteActive("/dashboard/member", "/dashboard/members", "section")).toBe(false);
    expect(isRouteActive("/dashboard/employees/e-1", "/dashboard/employees", "section")).toBe(true);
    expect(
      isRouteActive("/dashboard/departments/d-1/edit", "/dashboard/departments", "section"),
    ).toBe(true);
  });
});

describe("getSafeInternalPath", () => {
  const allowed = ["/dashboard"] as const;

  it("accepts dashboard paths and rejects the rest", () => {
    expect(getSafeInternalPath("/dashboard/departments", allowed)).toBe("/dashboard/departments");
    expect(getSafeInternalPath("/dashboard/employees/e-1?tab=1", allowed)).toBe(
      "/dashboard/employees/e-1?tab=1",
    );
    expect(getSafeInternalPath("/login", allowed)).toBeNull();
    expect(getSafeInternalPath("//evil.com/dashboard", allowed)).toBeNull();
    expect(getSafeInternalPath("https://evil.com/dashboard", allowed)).toBeNull();
    expect(getSafeInternalPath(null, allowed)).toBeNull();
  });
});
