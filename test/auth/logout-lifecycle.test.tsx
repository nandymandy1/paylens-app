import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FC, PropsWithChildren } from "react";
import { RequireAnonymous, RequireAuth } from "@/components/auth/AuthGuards";
import { useLogout, useMe, useVerifyEmail } from "@/hooks/useAuth";
import { authKeys } from "@/services/auth.service";
import api, { ApiError } from "@/services/api";
import useAuthSessionStore from "@/stores/auth-session";

vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
  API_BASE_URL: "http://localhost:4000/api/v1",
  ApiError: class ApiError extends Error {
    readonly code: string;
    readonly status: number;

    constructor(code: string, message: string, status: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
}));

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => "/dashboard/members",
  useSearchParams: () => new URLSearchParams(),
}));

const mockedApi = vi.mocked(api, true);

const mePayload = {
  user: { id: "u-1", email: "me@acme.example", firstName: "M", lastName: "E" },
  memberships: [],
  activeOrganization: { id: "org-1", name: "Acme", slug: "acme" },
  activeMembership: null,
  onboardingRequired: false,
  organizationSelectionRequired: false,
};

// Mirrors AppProviders defaults: cached sessions stay fresh without re-probing.
const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 } } });

const Wrapper: FC<PropsWithChildren<{ client: QueryClient }>> = ({ client, children }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

const LogoutButton: FC = () => {
  const logout = useLogout();

  return (
    <button type="button" onClick={() => logout.mutate()}>
      logout
    </button>
  );
};

const MeObserver: FC = () => {
  const { data } = useMe();

  return <p>{data ? "session-live" : "session-empty"}</p>;
};

describe("explicit logout lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthSessionStore.getState().resetForTests();
  });

  it("logs out to known anonymous without /auth/me, refresh, or invalidation", async () => {
    const client = createClient();

    useAuthSessionStore.getState().markAuthenticated();
    client.setQueryData(authKeys.me(), mePayload);
    mockedApi.post.mockResolvedValue({ data: { data: { loggedOut: true } } });

    render(
      <Wrapper client={client}>
        <MeObserver />
        <LogoutButton />
      </Wrapper>,
    );

    // Authenticated observer stays quiet: the outcome is already cached and
    // must not be re-probed as part of logout.
    await waitFor(() => {
      expect(mockedApi.get).not.toHaveBeenCalled();
    });

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/login");
    });

    expect(mockedApi.post).toHaveBeenCalledTimes(1);
    expect(mockedApi.post).toHaveBeenCalledWith("/auth/logout");
    // No session probe and no token refresh after explicit logout.
    expect(mockedApi.get).not.toHaveBeenCalledWith(expect.stringContaining("/auth/me"));
    expect(mockedApi.post).not.toHaveBeenCalledWith(
      expect.stringContaining("/auth/refresh"),
      expect.anything(),
      expect.anything(),
    );
    expect(useAuthSessionStore.getState().status).toBe("anonymous");
    expect(client.getQueryData(authKeys.me())).toBeUndefined();
  });

  it("still bootstraps unknown sessions through /auth/me", async () => {
    const client = createClient();

    mockedApi.get.mockResolvedValue({ data: { data: mePayload } });

    render(
      <Wrapper client={client}>
        <MeObserver />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("session-live")).toBeDefined();
    });

    expect(mockedApi.get).toHaveBeenCalledWith("/auth/me");
    expect(useAuthSessionStore.getState().status).toBe("authenticated");
  });

  it("settles terminal 401 unknown probes to known anonymous", async () => {
    const client = createClient();

    mockedApi.get.mockRejectedValue(new ApiError("AUTHENTICATION_REQUIRED", "unauthorized", 401));

    render(
      <Wrapper client={client}>
        <MeObserver />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(useAuthSessionStore.getState().status).toBe("anonymous");
    });
  });

  it("renders known anonymous login without probing /auth/me", async () => {
    const client = createClient();

    useAuthSessionStore.getState().markAnonymous();

    render(
      <Wrapper client={client}>
        <RequireAnonymous redirectTo="/dashboard">
          <p>login form</p>
        </RequireAnonymous>
      </Wrapper>,
    );

    expect(await screen.findByText("login form")).toBeDefined();
    expect(mockedApi.get).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("lets logout win over an in-flight /auth/me bootstrap", async () => {
    const client = createClient();
    let resolveMe!: (value: unknown) => void;

    useAuthSessionStore.getState().markAuthenticated();
    mockedApi.get.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMe = resolve;
      }),
    );
    mockedApi.post.mockResolvedValue({ data: { data: { loggedOut: true } } });

    render(
      <Wrapper client={client}>
        <MeObserver />
        <LogoutButton />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/auth/me");
    });

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/login");
    });

    // The stale bootstrap resolves only after logout settled: it must not
    // restore user, organization, or guard state.
    resolveMe({ data: { data: mePayload } });

    await waitFor(() => {
      expect(useAuthSessionStore.getState().status).toBe("anonymous");
    });

    // Give the late response a tick to (not) land in the cache.
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(client.getQueryData(authKeys.me())).toBeUndefined();
    expect(useAuthSessionStore.getState().status).toBe("anonymous");
  });

  it("reconciles to unknown instead of false anonymous when logout fails", async () => {
    const client = createClient();

    useAuthSessionStore.getState().markAuthenticated();
    client.setQueryData(authKeys.me(), mePayload);
    mockedApi.post.mockRejectedValueOnce(new Error("network down"));
    mockedApi.get.mockResolvedValue({ data: { data: mePayload } });

    render(
      <Wrapper client={client}>
        <MeObserver />
        <LogoutButton />
      </Wrapper>,
    );

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    // Ambiguous failure: /auth/me is re-probed to resolve server truth —
    // never an immediate false anonymous claim, never a login push.
    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(expect.stringContaining("/auth/me"));
    });

    expect(push).not.toHaveBeenCalledWith("/login");
    // The server session still exists, so reconciliation lands authenticated.
    await waitFor(() => {
      expect(useAuthSessionStore.getState().status).toBe("authenticated");
    });
  });

  it("redirects known anonymous protected routes to login without probing", async () => {
    const client = createClient();

    useAuthSessionStore.getState().markAnonymous();

    render(
      <Wrapper client={client}>
        <RequireAuth>
          <p>protected</p>
        </RequireAuth>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(expect.stringContaining("/login?redirect_to="));
    });

    expect(mockedApi.get).not.toHaveBeenCalledWith(expect.stringContaining("/auth/me"));
    expect(screen.queryByText("protected")).toBeNull();
  });

  it("marks verify-email success authenticated with canonical auth/me", async () => {
    const client = createClient();

    useAuthSessionStore.getState().markAnonymous();
    mockedApi.post.mockResolvedValue({ data: { data: { user: mePayload.user } } });
    mockedApi.get.mockResolvedValue({ data: { data: mePayload } });

    const VerifyButton: FC = () => {
      const verify = useVerifyEmail();

      return (
        <button type="button" onClick={() => verify.mutate("token-1")}>
          verify
        </button>
      );
    };

    render(
      <Wrapper client={client}>
        <VerifyButton />
      </Wrapper>,
    );

    await userEvent.click(screen.getByRole("button", { name: "verify" }));

    await waitFor(() => {
      expect(useAuthSessionStore.getState().status).toBe("authenticated");
    });

    expect(client.getQueryData(authKeys.me())).toBeDefined();
  });
});
