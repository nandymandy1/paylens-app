import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeeProfilePage from "@/app/dashboard/employees/[employeeId]/page";

vi.mock("@/hooks/useAuth", () => ({
  useMe: vi.fn(() => ({
    data: {
      user: { id: "u-1", email: "me@acme.example", firstName: "M", lastName: "E" },
      activeMembership: { id: "m-1", role: "HR_MANAGER", status: "ACTIVE" },
      activeOrganization: { id: "org-1", name: "Acme", slug: "acme" },
    },
  })),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(() => ({ employeeId: "emp-1" })),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams("")),
  usePathname: vi.fn(() => "/dashboard/employees/emp-1"),
}));

const fetchEmployeeMock = vi.hoisted(() =>
  vi.fn(async () => ({
    id: "emp-1",
    employeeNumber: "PLD-004281",
    firstName: "Olivia",
    lastName: "Carter",
    workEmail: "olivia.carter@acme.example",
    department: { id: "dept-eng", code: "ENG", name: "Engineering" },
    jobTitle: "Engineer",
    level: "L4",
    countryCode: "IN",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    hireDate: "2022-03-01",
    terminationDate: null,
    createdAt: "2022-03-01T00:00:00.000Z",
    updatedAt: "2022-03-02T00:00:00.000Z",
  })),
);

vi.mock("@/services/employee.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/employee.service")>();

  return {
    ...actual,
    fetchEmployee: fetchEmployeeMock,
    fetchEmployees: vi.fn(async () => ({
      items: [],
      pageInfo: { nextCursor: null, hasNextPage: false },
    })),
    fetchDepartments: vi.fn(async () => []),
  };
});

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return render(<EmployeeProfilePage />, { wrapper: Wrapper });
};

describe("employee profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchEmployeeMock.mockImplementation(async () => ({
      id: "emp-1",
      employeeNumber: "PLD-004281",
      firstName: "Olivia",
      lastName: "Carter",
      workEmail: "olivia.carter@acme.example",
      department: { id: "dept-eng", code: "ENG", name: "Engineering" },
      jobTitle: "Engineer",
      level: "L4",
      countryCode: "IN",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      hireDate: "2022-03-01",
      terminationDate: null,
      createdAt: "2022-03-01T00:00:00.000Z",
      updatedAt: "2022-03-02T00:00:00.000Z",
    }));
  });

  it("loads workforce data with a compensation placeholder and a back link", async () => {
    renderPage();

    const names = await screen.findAllByText("Olivia Carter");

    expect(names.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: "Olivia Carter" })).toBeTruthy();
    expect(screen.getByText("PLD-004281")).toBeTruthy();
    expect(screen.getByText("Engineering")).toBeTruthy();
    expect(screen.getByText("Engineer")).toBeTruthy();
    expect(
      screen.getByText("Compensation will be available in the compensation workspace."),
    ).toBeTruthy();

    const backLink = screen.getByText("Employees").closest("a");

    expect(backLink?.getAttribute("href")).toBe("/dashboard/employees");
  });

  it("shows a not-found state when the employee is unavailable", async () => {
    fetchEmployeeMock.mockImplementationOnce(async () => {
      throw new Error("not found");
    });

    renderPage();

    expect(await screen.findByText("Employee not found")).toBeTruthy();
    expect(
      screen.getByText("This employee is unavailable in your active organization."),
    ).toBeTruthy();
  });
});
