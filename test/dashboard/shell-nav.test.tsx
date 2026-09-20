import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardShell from "@/components/dashboard/DashboardShell";
import useSidebarStore from "@/stores/sidebar";
import type { OrganizationRole } from "@/types/organization.type";

let mockedRole: OrganizationRole | undefined = "EMPLOYEE";
let mockedPathname = "/dashboard";

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
  usePathname: () => mockedPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// The shell also mounts the floating DataTransferCenter (React Query).
// Nav assertions do not cover transfers, so stub the whole hook module.
vi.mock("@/hooks/useEmployeeTransfer", () => {
  const list = () => ({ data: [], isPending: false });
  const control = () => ({ mutate: vi.fn(), isPending: false });

  return {
    useEmployeeExports: list,
    useEmployeeImports: list,
    useEmployeeExportJob: () => ({ data: null }),
    useEmployeeImportJob: () => ({ data: null }),
    useCreateExport: control,
    usePauseExport: control,
    useResumeExport: control,
    useCancelExport: control,
    useDownloadExport: control,
    useStartImport: control,
    useConfirmImport: control,
    usePauseImport: control,
    useResumeImport: control,
    useCancelImport: control,
    useDownloadImportReport: control,
  };
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("dashboard shell member navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRole = "EMPLOYEE";
    mockedPathname = "/dashboard";
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
    expect(
      screen
        .getAllByAltText("PayLens")
        .some((element) => element.getAttribute("src") === "/brand/paylens-mark.svg"),
    ).toBe(true);
  });

  it("uses the compact wordmark in the expanded sidebar and mobile header", () => {
    render(
      <DashboardShell>
        <p>dashboard</p>
      </DashboardShell>,
    );

    expect(screen.getAllByRole("img", { name: "PayLens" }).length).toBeGreaterThan(0);
  });
});

describe("dashboard sidebar route matching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRole = "TENANT_OWNER";
    mockedPathname = "/dashboard";

    act(() => {
      useSidebarStore.getState().setSidebarCollapsed(false);
    });
  });

  const activeLabels = () =>
    screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page")
      .map((link) => link.textContent);

  it.each([
    ["/dashboard", ["Dashboard"]],
    ["/dashboard/members", ["Members"]],
    ["/dashboard/members/m-1", ["Members"]],
    ["/dashboard/employees", ["Employees"]],
    ["/dashboard/employees/e-1", ["Employees"]],
    ["/dashboard/departments", ["Departments"]],
    ["/dashboard/departments/new", ["Departments"]],
    ["/dashboard/departments/d-1/edit", ["Departments"]],
  ])("marks exactly one owner for %s", (pathname, expected) => {
    mockedPathname = pathname;

    render(
      <DashboardShell>
        <p>dashboard</p>
      </DashboardShell>,
    );

    expect(activeLabels()).toEqual(expected);
  });

  it("never marks Dashboard active on child feature routes", () => {
    mockedPathname = "/dashboard/departments";

    render(
      <DashboardShell>
        <p>dashboard</p>
      </DashboardShell>,
    );

    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    const departments = screen.getByRole("link", { name: "Departments" });

    expect(dashboard.getAttribute("aria-current")).toBeNull();
    expect(departments.getAttribute("aria-current")).toBe("page");
  });
});
