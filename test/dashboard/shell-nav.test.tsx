import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardShell from "@/components/dashboard/DashboardShell";
import useSidebarStore from "@/stores/sidebar";
import type { OrganizationRole } from "@/types/organization.type";

let mockedRole: OrganizationRole | undefined = "EMPLOYEE";

vi.mock("@/hooks/useAuth", () => ({
  useMe: vi.fn(() => ({
    data: {
      user: { id: "u-1", email: "me@acme.example", firstName: "M", lastName: "E" },
      memberships: [{ id: "m-1", organizationId: "org-1", role: mockedRole, status: "ACTIVE" }],
      activeOrganization: { id: "org-1", name: "Acme", slug: "acme" },
      activeMembership:
        mockedRole === undefined ? null : { id: "m-1", role: mockedRole, status: "ACTIVE" },
    },
  })),
  useLogout: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("dashboard shell member navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRole = "EMPLOYEE";
    act(() => {
      useSidebarStore.getState().setSidebarCollapsed(false);
    });
  });

  for (const role of ["MANAGER", "EMPLOYEE", "VIEWER_AUDITOR"] as const) {
    it(`hides the Members navigation from ${role}`, () => {
      mockedRole = role;

      render(
        <DashboardShell>
          <p>dashboard</p>
        </DashboardShell>,
      );

      expect(screen.queryByText("Members")).toBeNull();
      expect(screen.getByText("dashboard")).toBeDefined();
    });
  }

  for (const role of ["TENANT_OWNER", "HR_ADMIN", "HR_MANAGER"] as const) {
    it(`shows the Members navigation to ${role}`, () => {
      mockedRole = role;

      render(
        <DashboardShell>
          <p>dashboard</p>
        </DashboardShell>,
      );

      expect(screen.getByText("Members")).toBeDefined();
    });
  }

  it("keeps the dashboard header fixed across mobile and expanded desktop layout", () => {
    render(
      <DashboardShell>
        <p>dashboard</p>
      </DashboardShell>,
    );

    const header = screen.getByRole("banner");

    expect(header.className).toContain("fixed");
    expect(header.className).toContain("top-0");
    expect(header.className).toContain("left-0");
    expect(header.className).toContain("right-0");
    expect(header.className).toContain("md:left-60");
    expect(header.className).not.toContain("md:left-16");
    expect(header.className).not.toMatch(/\bw-\[calc\(|\bmax-w-/);
  });

  it("uses the collapsed desktop sidebar offset for the fixed header", () => {
    act(() => {
      useSidebarStore.getState().setSidebarCollapsed(true);
    });

    render(
      <DashboardShell>
        <p>dashboard</p>
      </DashboardShell>,
    );

    const header = screen.getByRole("banner");

    expect(header.className).toContain("fixed");
    expect(header.className).toContain("top-0");
    expect(header.className).toContain("left-0");
    expect(header.className).toContain("right-0");
    expect(header.className).toContain("md:left-16");
    expect(header.className).not.toContain("md:left-60");
    expect(header.className).not.toMatch(/\bw-\[calc\(|\bmax-w-/);
  });
});
