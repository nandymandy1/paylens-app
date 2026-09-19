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
let mockedOrganizationId: string | undefined = "org-1";
let mockedSearchParams = new URLSearchParams("");
let mockedParams: Record<string, string> = {};
const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useMe: vi.fn(() => ({
    data:
      mockedRole === undefined
        ? undefined
        : {
            user: { id: "u-1", email: "me@acme.example", firstName: "M", lastName: "E" },
            activeMembership: { id: "m-1", role: mockedRole, status: "ACTIVE" },
            activeOrganization: mockedOrganizationId
              ? { id: mockedOrganizationId, name: "Acme", slug: "acme" }
              : undefined,
          },
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: pushMock, replace: replaceMock })),
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
  vi.fn(async (departmentId: string): Promise<DepartmentSummary> => {
    if (departmentId === "dept-fin") {
      return {
        id: departmentId,
        code: "FIN",
        name: "Finance",
        employeeCount: 5,
        createdAt: "2026-09-12T00:00:00.000Z",
        updatedAt: "2026-09-12T00:00:00.000Z",
      };
    }

    return {
      id: departmentId,
      code: "ENG",
      name: "Engineering",
      employeeCount: 5,
      createdAt: "2026-09-12T00:00:00.000Z",
      updatedAt: "2026-09-12T00:00:00.000Z",
    };
  }),
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
    mockedOrganizationId = "org-1";
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

    // Creation is modal-first: no route navigation from the normal UI.
    expect(screen.queryByRole("link", { name: "Add department" })).toBeNull();

    const addButton = screen.getByRole("button", { name: "Add department" });

    fireEvent.click(addButton);

    expect(pushMock).toHaveBeenCalledWith("/dashboard/departments?departmentModal=create", {
      scroll: false,
    });
  });

  it("opens edit through the modal URL instead of a route", async () => {
    renderWithClient(<DepartmentsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Edit Engineering" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/dashboard/departments?departmentModal=edit&departmentId=dept-eng",
      { scroll: false },
    );
  });

  it("hides management actions from read-only roles", async () => {
    mockedRole = "MANAGER";

    renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Engineering")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Add department" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete Engineering" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Edit Engineering" })).toBeNull();
  });

  it("creates through the modal and closes it on success", async () => {
    const { rerender } = renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Engineering")).toBeTruthy();

    mockedSearchParams = new URLSearchParams("departmentModal=create");
    rerender(<DepartmentsPage />);

    expect(await screen.findByRole("heading", { name: "Create department" })).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("Engineering"), {
      target: { value: "Platform" },
    });
    fireEvent.change(screen.getByPlaceholderText("ENG"), { target: { value: "PLT" } });
    fireEvent.click(screen.getByRole("button", { name: "Create department" }));

    await waitFor(() => {
      expect(createDepartmentMock).toHaveBeenCalledWith({ code: "PLT", name: "Platform" });
    });

    // Success clears modal params instead of navigating away.
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/departments", { scroll: false });
    });
  });

  it("keeps the create modal open on duplicate codes", async () => {
    const { rerender } = renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Engineering")).toBeTruthy();

    mockedSearchParams = new URLSearchParams("departmentModal=create");
    rerender(<DepartmentsPage />);

    expect(await screen.findByRole("heading", { name: "Create department" })).toBeTruthy();

    createDepartmentMock.mockRejectedValueOnce(
      new ApiError(
        "DEPARTMENT_CODE_ALREADY_EXISTS",
        "A department with this code already exists.",
        409,
      ),
    );

    fireEvent.change(screen.getByPlaceholderText("Engineering"), {
      target: { value: "Engineering" },
    });
    fireEvent.change(screen.getByPlaceholderText("ENG"), { target: { value: "ENG" } });
    fireEvent.click(screen.getByRole("button", { name: "Create department" }));

    expect(await screen.findByText("A department with this code already exists.")).toBeTruthy();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("edits through a prefilled modal and closes on success", async () => {
    const { rerender } = renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Engineering")).toBeTruthy();

    mockedSearchParams = new URLSearchParams("departmentModal=edit&departmentId=dept-eng");
    rerender(<DepartmentsPage />);

    expect(await screen.findByDisplayValue("Engineering")).toBeTruthy();

    fireEvent.change(screen.getByDisplayValue("Engineering"), {
      target: { value: "Engineering Org" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateDepartmentMock).toHaveBeenCalledWith("dept-eng", {
        code: "ENG",
        name: "Engineering Org",
      });
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/departments", { scroll: false });
    });
  });

  it("confirms deletion through the URL and surfaces DEPARTMENT_IN_USE safely", async () => {
    const { rerender } = renderWithClient(<DepartmentsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete Finance" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/dashboard/departments?departmentModal=delete&departmentId=dept-fin",
      { scroll: false },
    );

    mockedSearchParams = new URLSearchParams("departmentModal=delete&departmentId=dept-fin");
    rerender(<DepartmentsPage />);

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
      await screen.findByText(
        "This department cannot be deleted because employees are assigned to it.",
      ),
    ).toBeTruthy();
    expect(deleteDepartmentMock).toHaveBeenCalledWith("dept-fin");
    // Conflict keeps the modal URL: no success navigation.
    expect(replaceMock).not.toHaveBeenCalled();

    deleteDepartmentMock.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole("button", { name: "Delete department" }));

    await waitFor(() => {
      expect(deleteDepartmentMock).toHaveBeenCalledTimes(2);
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/departments", { scroll: false });
    });
  });

  it("disables the delete confirm while the mutation is in flight", async () => {
    const { rerender } = renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Engineering")).toBeTruthy();

    let resolveDelete: (() => void) | undefined;

    deleteDepartmentMock.mockImplementationOnce(
      () =>
        new Promise<undefined>((resolve) => {
          resolveDelete = () => resolve(undefined);
        }),
    );

    mockedSearchParams = new URLSearchParams("departmentModal=delete&departmentId=dept-fin");
    rerender(<DepartmentsPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete department" }));

    const confirm = (await screen.findByRole("button", {
      name: "Delete department",
    })) as HTMLButtonElement;

    expect(confirm.disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    // A second confirm cannot issue a duplicate delete.
    fireEvent.click(confirm);
    expect(deleteDepartmentMock).toHaveBeenCalledTimes(1);

    resolveDelete?.();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/departments", { scroll: false });
    });
  });

  it("ignores invalid modal params without a broken modal", async () => {
    mockedSearchParams = new URLSearchParams("departmentModal=banana");

    renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Engineering")).toBeTruthy();
    expect(screen.queryByText("Create department")).toBeNull();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/departments", { scroll: false });
    });
  });

  it("ignores edit without an entity id", async () => {
    mockedSearchParams = new URLSearchParams("search=eng&sort=name&departmentModal=edit");

    renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Engineering")).toBeTruthy();
    expect(screen.queryByText("Edit department")).toBeNull();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/departments?search=eng&sort=name", {
        scroll: false,
      });
    });
  });

  it("cleans delete without an id", async () => {
    mockedSearchParams = new URLSearchParams("departmentModal=delete");
    renderWithClient(<DepartmentsPage />);

    expect(await screen.findByText("Engineering")).toBeTruthy();
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/departments", { scroll: false });
    });
  });

  it("ignores a create-mode stray id without loading detail", async () => {
    mockedSearchParams = new URLSearchParams("departmentModal=create&departmentId=dept-eng");
    renderWithClient(<DepartmentsPage />);

    expect(await screen.findByRole("heading", { name: "Create department" })).toBeTruthy();
    expect(fetchDepartmentMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/departments?departmentModal=create", {
        scroll: false,
      });
    });
  });

  it("closes a department modal through Org A to unknown to Org B", async () => {
    mockedSearchParams = new URLSearchParams("departmentModal=edit&departmentId=dept-eng");
    const { rerender } = renderWithClient(<DepartmentsPage />);

    expect(await screen.findByRole("heading", { name: "Edit department" })).toBeTruthy();

    mockedOrganizationId = undefined;
    rerender(<DepartmentsPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/departments", { scroll: false });
    });

    // The production router has already replaced the URL before Org B resolves.
    mockedSearchParams = new URLSearchParams("");

    mockedOrganizationId = "org-2";
    rerender(<DepartmentsPage />);

    expect(screen.queryByRole("heading", { name: "Edit department" })).toBeNull();
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
