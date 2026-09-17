import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MembersPage from "@/app/dashboard/members/page";
import type { OrganizationRole } from "@/types/organization.type";

let mockedRole: OrganizationRole | undefined = "TENANT_OWNER";

vi.mock("@/hooks/useAuth", () => ({
  useMe: vi.fn(() => ({
    data:
      mockedRole === undefined
        ? undefined
        : {
            user: { id: "u-1", email: "me@acme.example", firstName: "M", lastName: "E" },
            activeMembership: { id: "m-1", role: mockedRole, status: "ACTIVE" },
          },
  })),
}));

const membersFixture = [
  {
    id: "m-owner",
    userId: "u-owner",
    email: "owner@acme.example",
    firstName: "O",
    lastName: "W",
    role: "TENANT_OWNER",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "m-emp",
    userId: "u-emp",
    email: "emp@acme.example",
    firstName: "E",
    lastName: "M",
    role: "EMPLOYEE",
    status: "ACTIVE",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

vi.mock("@/services/organization.service", () => ({
  organizationKeys: {
    members: () => ["organizations", "members"],
    invitations: () => ["organizations", "invitations"],
  },
  fetchMembers: vi.fn(async () => membersFixture),
  fetchInvitations: vi.fn(async () => []),
  inviteMember: vi.fn(async () => ({})),
  revokeInvitation: vi.fn(async () => ({})),
  changeMemberRole: vi.fn(async () => ({})),
}));

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return render(<MembersPage />, { wrapper: Wrapper });
};

describe("members page role visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRole = "TENANT_OWNER";
  });

  for (const role of ["MANAGER", "EMPLOYEE", "VIEWER_AUDITOR"] as const) {
    it(`hides member administration from ${role}`, async () => {
      mockedRole = role;

      renderPage();

      expect(
        await screen.findByText(
          "Your role cannot manage organization members. Contact your workspace administrator.",
        ),
      ).toBeDefined();
      expect(screen.queryByLabelText("invite-email")).toBeNull();
      expect(screen.queryByText("Invite member")).toBeNull();
      expect(screen.queryByText("Active members")).toBeNull();
    });
  }

  it("offers HR_MANAGER only the EMPLOYEE invite option", async () => {
    mockedRole = "HR_MANAGER";

    renderPage();

    expect(await screen.findByRole("combobox", { name: "Role" })).toBeDefined();
  });

  it("offers HR_ADMIN the allowed invite roles without TENANT_OWNER", async () => {
    mockedRole = "HR_ADMIN";

    renderPage();

    expect(await screen.findByRole("combobox", { name: "Role" })).toBeDefined();
  });

  it("renders the owner row as non-editable TENANT_OWNER text", async () => {
    mockedRole = "TENANT_OWNER";

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("owner@acme.example")).toBeDefined();
    });

    const ownerRole = screen.getByText("TENANT_OWNER");

    expect(ownerRole.tagName).toBe("P");
    expect(screen.queryByRole("combobox", { name: "Role for owner@acme.example" })).toBeNull();
    // Non-owner rows stay editable for the owner.
    expect(screen.queryByRole("combobox", { name: "Role for emp@acme.example" })).not.toBeNull();
  });

  it("shows role text instead of selects when HR_ADMIN views members", async () => {
    mockedRole = "HR_ADMIN";

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("emp@acme.example")).toBeDefined();
    });

    expect(screen.queryByRole("combobox", { name: "Role for emp@acme.example" })).toBeNull();

    const roleText = document.querySelector('p[aria-label="Role for emp@acme.example"]');

    expect(roleText?.textContent).toBe("EMPLOYEE");
  });
});
