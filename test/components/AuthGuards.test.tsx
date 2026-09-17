import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAnonymous, RequireAuth } from "@/components/auth/AuthGuards";

const replace = vi.fn();
let mockedMe: { data?: unknown; error?: unknown; isLoading: boolean } = { isLoading: true };
let mockedPathname = "/dashboard/members";

vi.mock("@/hooks/useAuth", () => ({
  useMe: vi.fn(() => mockedMe),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => mockedPathname,
  useSearchParams: () => new URLSearchParams(),
}));

describe("auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPathname = "/dashboard/members";
    mockedMe = { isLoading: true };
  });

  it("renders the login page for anonymous sessions without navigating", async () => {
    mockedMe = { isLoading: false, error: new Error("unauthorized"), data: undefined };

    render(
      <RequireAnonymous redirectTo="/dashboard">
        <p>login form</p>
      </RequireAnonymous>,
    );

    expect(await screen.findByText("login form")).toBeDefined();
    expect(replace).not.toHaveBeenCalled();
  });

  it("preserves a valid redirect_to for already-authenticated visitors", async () => {
    mockedMe = {
      isLoading: false,
      data: {
        onboardingRequired: false,
        organizationSelectionRequired: false,
        user: { id: "u" },
      },
    };

    render(
      <RequireAnonymous redirectTo="/dashboard/members">
        <p>login form</p>
      </RequireAnonymous>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboard/members");
    });
  });

  it("sanitizes a nested login destination to /dashboard", async () => {
    mockedMe = {
      isLoading: false,
      data: {
        onboardingRequired: false,
        organizationSelectionRequired: false,
        user: { id: "u" },
      },
    };

    render(
      <RequireAnonymous redirectTo="/login?redirect_to=/dashboard">
        <p>login form</p>
      </RequireAnonymous>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects stale dashboard sessions exactly once with the deep link preserved", async () => {
    mockedMe = { isLoading: false, error: new Error("expired"), data: undefined };

    render(
      <RequireAuth>
        <p>members</p>
      </RequireAuth>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledTimes(1);
    });
    expect(replace).toHaveBeenCalledWith("/login?redirect_to=%2Fdashboard%2Fmembers");
  });
});
