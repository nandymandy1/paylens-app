import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAnonymous, RequireAuth } from "@/components/auth/AuthGuards";
import { useMe } from "@/hooks/useAuth";
import useAuthSessionStore from "@/stores/auth-session";

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
    useAuthSessionStore.getState().resetForTests();
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

  it("skips the session probe for known anonymous visitors", async () => {
    useAuthSessionStore.getState().markAnonymous();
    mockedMe = { isLoading: false, error: new Error("unauthorized"), data: undefined };

    render(
      <RequireAnonymous redirectTo="/dashboard">
        <p>login form</p>
      </RequireAnonymous>,
    );

    expect(await screen.findByText("login form")).toBeDefined();
    expect(vi.mocked(useMe)).toHaveBeenCalledWith({ enabled: false });
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects stale dashboard sessions exactly once with the deep link preserved", async () => {
    useAuthSessionStore.getState().markAnonymous();
    mockedMe = { isLoading: false, error: new Error("expired"), data: undefined };

    render(
      <RequireAuth>
        <p>members</p>
      </RequireAuth>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledTimes(1);
    });
    expect(replace).toHaveBeenCalledWith("/auth/login?redirect_to=%2Fdashboard%2Fmembers");
  });

  it("blocks stale protected content and offers retry on a reconciliation error", () => {
    useAuthSessionStore.getState().markAuthError();
    mockedMe = {
      isLoading: false,
      data: { activeOrganization: { id: "org-a" }, user: { id: "u" } },
    };

    render(
      <RequireAuth>
        <p>stale tenant content</p>
      </RequireAuth>,
    );

    expect(screen.getByText("Unable to verify your session")).toBeDefined();
    expect(screen.getByRole("button", { name: "Retry" })).toBeDefined();
    expect(screen.queryByText("stale tenant content")).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });
});
