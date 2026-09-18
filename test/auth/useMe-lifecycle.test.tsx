import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api";
import useAuthSessionStore from "@/stores/auth-session";

const fetchMeMock = vi.hoisted(() => vi.fn());
const switchOrganizationMock = vi.hoisted(() => vi.fn());

vi.mock("@/services/auth.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/auth.service")>();

  return {
    ...actual,
    fetchMe: fetchMeMock,
    switchOrganization: switchOrganizationMock,
  };
});

import { authKeys } from "@/services/auth.service";
import { reconcileAuthMe, useMe, useSwitchOrganization } from "@/hooks/useAuth";

const createWrapper = (): FC<PropsWithChildren> => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const TestQueryClientProvider: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  TestQueryClientProvider.displayName = "TestQueryClientProvider";

  return TestQueryClientProvider;
};

describe("useMe bootstrap lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthSessionStore.getState().resetForTests();
  });

  it("marks a terminal /auth/me 401 anonymous", async () => {
    fetchMeMock.mockRejectedValueOnce(new ApiError("AUTHENTICATION_REQUIRED", "Sign in", 401));
    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthSessionStore.getState().status).toBe("anonymous");
  });

  it.each([
    ["server failure", new ApiError("INTERNAL_ERROR", "Unavailable", 500)],
    ["network failure", new ApiError("NETWORK_ERROR", "Network unavailable", 0)],
  ])("keeps the session in auth-error on %s", async (_label, error) => {
    fetchMeMock.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthSessionStore.getState().status).toBe("auth-error");
  });

  it("reconciles an authenticated session to anonymous after a terminal 401", async () => {
    useAuthSessionStore.getState().markAuthenticated();
    fetchMeMock.mockRejectedValueOnce(new ApiError("AUTHENTICATION_REQUIRED", "Sign in", 401));
    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthSessionStore.getState().status).toBe("anonymous");
  });

  it.each([
    ["server failure", new ApiError("INTERNAL_ERROR", "Unavailable", 500)],
    ["network failure", new ApiError("NETWORK_ERROR", "Network unavailable", 0)],
  ])("does not trust an authenticated session after %s", async (_label, error) => {
    useAuthSessionStore.getState().markAuthenticated();
    fetchMeMock.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthSessionStore.getState().status).toBe("auth-error");
  });

  it("recovers from auth-error when a retry succeeds", async () => {
    fetchMeMock
      .mockRejectedValueOnce(new ApiError("GATEWAY_ERROR", "Temporarily unavailable", 502))
      .mockResolvedValueOnce({ user: { id: "u-1" } });
    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(useAuthSessionStore.getState().status).toBe("auth-error"));
    await result.current.refetch();

    await waitFor(() => expect(useAuthSessionStore.getState().status).toBe("authenticated"));
  });

  it("removes Org-A auth state while a successful switch reconciles Org B", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const Wrapper: FC<PropsWithChildren> = ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const orgA = {
      activeOrganization: { id: "org-a" },
      onboardingRequired: false,
      organizationSelectionRequired: false,
    };
    const orgB = { ...orgA, activeOrganization: { id: "org-b" } };

    useAuthSessionStore.getState().markAuthenticated();
    client.setQueryData(authKeys.me(), orgA);
    switchOrganizationMock.mockResolvedValueOnce(undefined);
    fetchMeMock.mockRejectedValueOnce(new ApiError("INTERNAL_ERROR", "Unavailable", 500));

    const { result } = renderHook(() => useSwitchOrganization(), { wrapper: Wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync("org-b")).rejects.toBeInstanceOf(ApiError);
    });

    expect(client.getQueryData(authKeys.me())).toBeUndefined();
    expect(useAuthSessionStore.getState().status).toBe("auth-error");

    fetchMeMock.mockResolvedValueOnce(orgB);
    await client.fetchQuery({ queryKey: authKeys.me(), queryFn: reconcileAuthMe });

    expect(client.getQueryData(authKeys.me())).toEqual(orgB);
    expect(useAuthSessionStore.getState().status).toBe("authenticated");
  });
});
