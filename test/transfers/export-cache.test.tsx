import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FC, PropsWithChildren } from "react";
import { useLogout, useSwitchOrganization } from "@/hooks/useAuth";
import { transferKeys } from "@/services/employee-transfer.service";
import api from "@/services/api";
import useAuthSessionStore from "@/stores/auth-session";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/dashboard/employees",
  useSearchParams: () => new URLSearchParams(),
}));

const mockedApi = vi.mocked(api, true);

const orgAMe = {
  user: { id: "u-1", email: "me@acme.example", firstName: "M", lastName: "E" },
  memberships: [{ id: "m-a", organizationId: "org-a", role: "HR_MANAGER", status: "ACTIVE" }],
  activeOrganization: { id: "org-a", name: "A", slug: "a" },
  activeMembership: { id: "m-a", role: "HR_MANAGER", status: "ACTIVE" },
};

const orgBMe = {
  ...orgAMe,
  memberships: [{ id: "m-b", organizationId: "org-b", role: "HR_MANAGER", status: "ACTIVE" }],
  activeOrganization: { id: "org-b", name: "B", slug: "b" },
  activeMembership: { id: "m-b", role: "HR_MANAGER", status: "ACTIVE" },
};

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

const SwitchButton: FC = () => {
  const switchOrg = useSwitchOrganization();

  return (
    <button type="button" onClick={() => switchOrg.mutate("org-b")}>
      switch
    </button>
  );
};

describe("export cache isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthSessionStore.getState().resetForTests();
  });

  it("clears export and import cache on logout", async () => {
    const client = createClient();

    useAuthSessionStore.getState().markAuthenticated();
    client.setQueryData(transferKeys.exports("org-a"), [{ id: "exp-1" }]);
    client.setQueryData(transferKeys.imports("org-a"), [{ id: "imp-1" }]);
    mockedApi.post.mockResolvedValue({ data: { data: { loggedOut: true } } });

    render(
      <Wrapper client={client}>
        <LogoutButton />
      </Wrapper>,
    );

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(useAuthSessionStore.getState().status).toBe("anonymous");
    });

    expect(client.getQueryData(transferKeys.exports("org-a"))).toBeUndefined();
    expect(client.getQueryData(transferKeys.imports("org-a"))).toBeUndefined();
  });

  it("removes the previous tenant exports on organization switch", async () => {
    const client = createClient();

    useAuthSessionStore.getState().markAuthenticated();
    client.setQueryData(transferKeys.exports("org-a"), [{ id: "exp-1" }]);
    mockedApi.post.mockResolvedValue({ data: { data: { switched: true } } });
    mockedApi.get.mockResolvedValue({ data: { data: orgBMe } });

    const { authKeys } = await import("@/services/auth.service");

    client.setQueryData(authKeys.me(), orgAMe);

    render(
      <Wrapper client={client}>
        <SwitchButton />
      </Wrapper>,
    );

    await userEvent.click(screen.getByRole("button", { name: "switch" }));

    await waitFor(() => {
      expect(client.getQueryData(transferKeys.exports("org-a"))).toBeUndefined();
    });
  });

  it("restores the job list from the backend on remount", async () => {
    const client = createClient();

    useAuthSessionStore.getState().markAuthenticated();

    const { useEmployeeExports } = await import("@/hooks/useEmployeeTransfer");

    mockedApi.get.mockImplementation(async (url: string) => {
      if (url === "/auth/me") return { data: { data: orgAMe } };
      if (url === "/employee-exports")
        return { data: { data: [{ id: "exp-9", status: "COMPLETED" }] } };

      throw new Error(`unexpected ${url}`);
    });

    const Observer: FC = () => {
      const query = useEmployeeExports();

      return <p>{query.data ? `exports:${query.data.length}` : "loading"}</p>;
    };

    const { unmount } = render(
      <Wrapper client={client}>
        <Observer />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("exports:1")).toBeDefined();
    });

    unmount();

    render(
      <Wrapper client={client}>
        <Observer />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("exports:1")).toBeDefined();
    });
  });
});
