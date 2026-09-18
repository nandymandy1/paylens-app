import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DepartmentsPage from "@/app/dashboard/departments/page";
import NewDepartmentRoute from "@/app/dashboard/departments/new/page";
import EditDepartmentPage from "@/app/dashboard/departments/[departmentId]/edit/page";
import { ApiError } from "@/services/api";
import type { DepartmentSummary } from "@/types/department.type";
import type { OrganizationRole } from "@/types/organization.type";

let mockedRole: OrganizationRole | undefined = "HR_MANAGER";
let mockedSearchParams = new URLSearchParams("");
let mockedParams: Record<string, string> = {};
const pushMock = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useMe: vi.fn(() => ({
    data:
      mockedRole === undefined
        ? undefined
        : {
            user: { id: "u-1", email: "me@acme.example", firstName: "M", lastName: "E" },
            activeMembership: { id: "m-1", role: mockedRole, status: "ACTIVE" },
            activeOrganization: { id: "org-1", name: "Acme", slug: "acme" },
          },
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: pushMock, replace: vi.fn() })),
  useSearchParams: vi.fn(() => mockedSearchParams),
  useParams: vi.fn(() => mockedParams),
  usePathname: vi.fn(() => "/dashboard/departments"),
}));

const fetchDepartmentsMock = vi.hoisted(() =>
  vi.fn(async (): Promise<DepartmentSummary[]> => [
    {
      id: "dept-eng",
      code: "ENG",
      name: "Engineering",
      employeeCount: 2800,
      createdAt: "2026-09-12T00:00:00.000Z",
      updatedAt: "2026-09-12T00:00:00.000Z",
    },
    {
      id: "dept-fin",
      code: "FIN",
      name: "Finance",
      employeeCount: 650,
      createdAt: "2026-09-12T00:00:00.000Z",
      updatedAt: "2026-09-12T00:00:00.000Z",
    },
  ]),
);

const fetchDepartmentMock = vi.hoisted(() =>
  vi.fn(async (departmentId: string): Promise<DepartmentSummary> => ({
    id: departmentId,
    code: "ENG",
    name: "Engineering",
    employeeCount: 5,
    createdAt: "2026-09-12T00:00:00.000Z",
    updatedAt: "2026-09-12T00:00:00.000Z",
  })),
);

const createDepartmentMock = vi.hoisted(() =>
  vi.fn(async (input: { code: string; name: string }): Promise<DepartmentSummary> => ({
    id: "dept-new",
    code: input.code,
    name: input.name,
    employeeCount: 0,
    createdAt: "2026-09-18T00:00:00.000Z",
    updatedAt: "2026-09-18T00:00:00.000Z",
  })),
);

const updateDepartmentMock = vi.hoisted(() =>
  vi.fn(async (departmentId: string, input: { code: string; name: string }) => ({
    id: departmentId,
    code: input.code,
    name: input.name,
    employeeCount: 5,
    createdAt: "2026-09-12T00:00:00.000Z",
    updatedAt: "2026-09-18T00:00:00.000Z",
  })),
);

const deleteDepartmentMock = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("@/services/department.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/department.service")>();

  return {
    ...actual,
    fetchDepartments: fetchDepartmentsMock,
    fetchDepartment: fetchDepartmentMock,
    createDepartment: createDepartmentMock,
    updateDepartment: updateDepartmentMock,
    deleteDepartment: deleteDepartmentMock,
  };
});

const renderWithClient = (ui: React.ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
};

describe("department administration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRole = "HR_MANAGER";
    mockedSearchParams = new URLSearchParams("");
    mockedParams = {};
  });

  it("lists departments with counts and links into the filtered directory", async () => {
    renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Departments")).toBeTruthy();
    expect(await screen.findByText("Engineering")).toBeTruthy();
    expect(screen.getByText("ENG")).toBeTruthy();
    expect(await screen.findByText("2,800")).toBeTruthy();

    const directoryLink = screen.getByText("Engineering").closest("a");

    expect(directoryLink?.getAttribute("href")).toBe("/dashboard/employees?departmentId=dept-eng");

    const addLink = screen.getByRole("link", { name: "Add department" });

    expect(addLink.getAttribute("href")).toBe("/dashboard/departments/new");
  });

  it("hides management actions from read-only roles", async () => {
    mockedRole = "MANAGER";

    renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Engineering")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Add department" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete Engineering" })).toBeNull();
  });

  it("confirms deletion and surfaces DEPARTMENT_IN_USE safely", async () => {
    renderWithClient(<DepartmentsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete Finance" }));

    expect(await screen.findByText("Delete Finance?")).toBeTruthy();
    expect(
      screen.getByText("Departments can only be deleted when no employees are assigned to them."),
    ).toBeTruthy();

    deleteDepartmentMock.mockRejectedValueOnce(
      new ApiError(
        "DEPARTMENT_IN_USE",
        "Department has employees assigned and cannot be deleted.",
        409,
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete department" }));

    expect(
      await screen.findByText("Department cannot be deleted while employees are assigned to it."),
    ).toBeTruthy();
    expect(deleteDepartmentMock).toHaveBeenCalledWith("dept-fin");

    deleteDepartmentMock.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole("button", { name: "Delete department" }));

    await waitFor(() => {
      expect(deleteDepartmentMock).toHaveBeenCalledTimes(2);
    });
  });

  it("validates the create form and honors a safe return_to", async () => {
    mockedSearchParams = new URLSearchParams("return_to=/dashboard/employees/new");

    renderWithClient(<NewDepartmentRoute />);

    fireEvent.click(await screen.findByRole("button", { name: "Create department" }));

    expect(await screen.findByText("Department name must be at least 2 characters")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("Engineering"), {
      target: { value: "Engineering" },
    });
    fireEvent.change(screen.getByPlaceholderText("ENG"), { target: { value: "eng" } });
    fireEvent.click(screen.getByRole("button", { name: "Create department" }));

    await waitFor(() => {
      expect(createDepartmentMock).toHaveBeenCalledWith({ code: "ENG", name: "Engineering" });
      expect(pushMock).toHaveBeenCalledWith("/dashboard/employees/new");
    });
  });

  it("rejects an external return_to and maps duplicate codes", async () => {
    mockedSearchParams = new URLSearchParams("return_to=https://evil.example/phish");

    renderWithClient(<NewDepartmentRoute />);

    fireEvent.change(await screen.findByPlaceholderText("Engineering"), {
      target: { value: "Engineering" },
    });
    fireEvent.change(screen.getByPlaceholderText("ENG"), { target: { value: "ENG" } });

    createDepartmentMock.mockRejectedValueOnce(
      new ApiError(
        "DEPARTMENT_CODE_ALREADY_EXISTS",
        "A department with this code already exists.",
        409,
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Create department" }));

    expect(await screen.findByText("A department with this code already exists.")).toBeTruthy();

    createDepartmentMock.mockResolvedValueOnce({
      id: "dept-new",
      code: "ENG",
      name: "Engineering",
      employeeCount: 0,
      createdAt: "2026-09-18T00:00:00.000Z",
      updatedAt: "2026-09-18T00:00:00.000Z",
    });
    fireEvent.click(screen.getByRole("button", { name: "Create department" }));

    // External return targets are rejected: fall back to the department list.
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard/departments");
    });
  });

  it("prefills the edit form and saves changes", async () => {
    mockedParams = { departmentId: "dept-eng" };

    renderWithClient(<EditDepartmentPage />);

    expect(await screen.findByDisplayValue("Engineering")).toBeTruthy();
    expect(screen.getByDisplayValue("ENG")).toBeTruthy();

    fireEvent.change(screen.getByDisplayValue("Engineering"), {
      target: { value: "Engineering Org" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateDepartmentMock).toHaveBeenCalledWith("dept-eng", {
        code: "ENG",
        name: "Engineering Org",
      });
      expect(pushMock).toHaveBeenCalledWith("/dashboard/departments");
    });
  });

  it("shows a not-found state when the department cannot load", async () => {
    mockedParams = { departmentId: "dept-ghost" };
    fetchDepartmentMock.mockRejectedValueOnce(new Error("boom"));

    renderWithClient(<EditDepartmentPage />);

    expect(await screen.findByText("Department not found")).toBeTruthy();
  });
});
