import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FC, PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api";
import useAuthSessionStore from "@/stores/auth-session";

const fetchMeMock = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());

vi.mock("@/services/auth.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/auth.service")>();

  return { ...actual, fetchMe: fetchMeMock };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

import AuthCallbackPage from "@/app/auth/callback/page";

const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe("Google callback reconciliation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthSessionStore.getState().resetForTests();
  });

  it("keeps a temporary /auth/me failure recoverable and retries without OAuth", async () => {
    fetchMeMock
      .mockRejectedValueOnce(new ApiError("INTERNAL_ERROR", "Unavailable", 500))
      .mockResolvedValueOnce({ onboardingRequired: false, organizationSelectionRequired: false });

    render(<AuthCallbackPage />, { wrapper: Wrapper });

    expect(await screen.findByText("Try again")).toBeDefined();
    expect(useAuthSessionStore.getState().status).toBe("auth-error");
    expect(replace).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Retry session verification" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(fetchMeMock).toHaveBeenCalledTimes(2);
    expect(useAuthSessionStore.getState().status).toBe("authenticated");
  });

  it("redirects a terminal /auth/me 401 to login", async () => {
    fetchMeMock.mockRejectedValueOnce(new ApiError("AUTHENTICATION_REQUIRED", "Sign in", 401));

    render(<AuthCallbackPage />, { wrapper: Wrapper });

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/auth/login"));
    expect(useAuthSessionStore.getState().status).toBe("anonymous");
  });
});
