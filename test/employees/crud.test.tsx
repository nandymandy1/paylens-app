import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeesPage from "@/app/dashboard/employees/page";
import { ApiError } from "@/services/api";
import type { EmployeeDetail, EmployeeListItem } from "@/types/employee.type";
import type { OrganizationRole } from "@/types/organization.type";

let mockedRole: OrganizationRole | undefined = "HR_MANAGER";
let mockedOrganizationId = "org-1";
const replaceMock = vi.fn();
const pushMock = vi.fn();
let mockSearch = "";

const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  loading: vi.fn(),
  success: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: toastMock }));

vi.mock("@/hooks/useAuth", () => ({
  useMe: vi.fn(() => ({
    data:
      mockedRole === undefined
        ? undefined
        : {
            user: { id: "u-1", email: "me@acme.example", firstName: "M", lastName: "E" },
            activeMembership: { id: "m-1", role: mockedRole, status: "ACTIVE" },
            activeOrganization: {
              id: mockedOrganizationId,
              name: mockedOrganizationId === "org-1" ? "Acme" : "Globex",
              slug: mockedOrganizationId === "org-1" ? "acme" : "globex",
            },
          },
  })),
}));

vi.mock("next/navigation", () => {
  const applyUrl = (url: string) => {
    mockSearch = url.split("?")[1] ?? "";
  };

  return {
    useRouter: vi.fn(() => ({
      replace: vi.fn((url: string, options?: { scroll?: boolean }) => {
        replaceMock(url, options);
        applyUrl(url);
      }),
      push: vi.fn((url: string, options?: { scroll?: boolean }) => {
        pushMock(url, options);
        applyUrl(url);
      }),
    })),
    useSearchParams: vi.fn(() => new URLSearchParams(mockSearch)),
    useParams: vi.fn(() => ({})),
    usePathname: vi.fn(() => "/dashboard/employees"),
  };
});

const employeeFixture: EmployeeListItem = {
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
};

const detailFixture: EmployeeDetail = {
  ...employeeFixture,
  terminationDate: null,
  createdAt: "2022-03-01T00:00:00.000Z",
  updatedAt: "2022-03-02T00:00:00.000Z",
};

const fetchEmployeesMock = vi.hoisted(() =>
  vi.fn(async () => ({
    items: [employeeFixture],
    pageInfo: { nextCursor: null, hasNextPage: false },
  })),
);

const fetchEmployeeMock = vi.hoisted(() => vi.fn(async () => detailFixture));

const fetchDepartmentsMock = vi.hoisted(() =>
  vi.fn(async () => [{ id: "dept-eng", code: "ENG", name: "Engineering" }]),
);

const createEmployeeMock = vi.hoisted(() => vi.fn(async () => detailFixture));
const updateEmployeeMock = vi.hoisted(() => vi.fn(async () => detailFixture));
const deleteEmployeeMock = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("@/services/employee.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/employee.service")>();

  return {
    ...actual,
    fetchEmployees: fetchEmployeesMock,
    fetchEmployee: fetchEmployeeMock,
    fetchDepartments: fetchDepartmentsMock,
    createEmployee: createEmployeeMock,
    updateEmployee: updateEmployeeMock,
    deleteEmployee: deleteEmployeeMock,
  };
});

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return render(<EmployeesPage />, { wrapper: Wrapper });
};

const fillCreateForm = () => {
  fireEvent.change(screen.getByPlaceholderText("EMP-1024"), { target: { value: "EMP-1024" } });
  fireEvent.change(screen.getByPlaceholderText("Asha"), { target: { value: "Asha" } });
  fireEvent.change(screen.getByPlaceholderText("Sharma"), { target: { value: "Sharma" } });
  fireEvent.change(screen.getByPlaceholderText("Senior Engineer"), {
    target: { value: "Engineer" },
  });
  fireEvent.change(screen.getByLabelText(/Hire date/), { target: { value: "2024-03-12" } });
};

const selectCreateOptions = async () => {
  fireEvent.click(screen.getByLabelText("Department"));
  fireEvent.click(await screen.findByRole("option", { name: "Engineering (ENG)" }));
  fireEvent.click(screen.getByLabelText("Country"));
  fireEvent.click(await screen.findByRole("option", { name: "India (IN)" }));
  fireEvent.click(screen.getByLabelText("Employment type"));
  fireEvent.click(await screen.findByRole("option", { name: "FULL TIME" }));
};

describe("employee CRUD modals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    mockedRole = "HR_MANAGER";
    mockedOrganizationId = "org-1";
    mockSearch = "";
    fetchEmployeesMock.mockImplementation(async () => ({
      items: [employeeFixture],
      pageInfo: { nextCursor: null, hasNextPage: false },
    }));
    fetchEmployeeMock.mockImplementation(async () => detailFixture);
    fetchDepartmentsMock.mockImplementation(async () => [
      { id: "dept-eng", code: "ENG", name: "Engineering" },
    ]);
    createEmployeeMock.mockImplementation(async () => detailFixture);
    updateEmployeeMock.mockImplementation(async () => detailFixture);
    deleteEmployeeMock.mockImplementation(async () => undefined);
  });

  it("opens creation through the modal URL, never a route", async () => {
    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Add employee" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Add employee" }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/employees?employeeModal=create", {
      scroll: false,
    });
  });

  it("hides row actions from read-only roles", async () => {
    mockedRole = "MANAGER";

    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Add employee" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Edit Olivia Carter" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete Olivia Carter" })).toBeNull();
  });

  it("loads departments into the create form and creates successfully", async () => {
    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    mockSearch = "employeeModal=create";
    rerender(<EmployeesPage />);

    expect(await screen.findByRole("heading", { name: "Add employee" })).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Department"));
    fireEvent.click(await screen.findByRole("option", { name: "Engineering (ENG)" }));

    fillCreateForm();

    fireEvent.click(screen.getByLabelText("Country"));
    fireEvent.click(screen.getByRole("option", { name: "India (IN)" }));

    fireEvent.click(screen.getByLabelText("Employment type"));
    fireEvent.click(screen.getByRole("option", { name: "FULL TIME" }));

    fireEvent.click(screen.getByRole("button", { name: "Create employee" }));

    await waitFor(() => {
      expect(createEmployeeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeNumber: "EMP-1024",
          firstName: "Asha",
          lastName: "Sharma",
          departmentId: "dept-eng",
          jobTitle: "Engineer",
          countryCode: "IN",
          employmentType: "FULL_TIME",
          hireDate: "2024-03-12",
          idempotencyKey: expect.any(String),
        }),
      );
    });

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/employees", { scroll: false });
    });
  });

  it("shows an understandable state when no departments exist", async () => {
    fetchDepartmentsMock.mockImplementationOnce(async () => []);

    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    mockSearch = "employeeModal=create";
    rerender(<EmployeesPage />);

    expect(
      await screen.findByText("No departments available. Create a department first."),
    ).toBeTruthy();
  });

  it("validates the create form without calling the API", async () => {
    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    mockSearch = "employeeModal=create";
    rerender(<EmployeesPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Create employee" }));

    expect(await screen.findByText("Employee number is required")).toBeTruthy();
    expect(createEmployeeMock).not.toHaveBeenCalled();
  });

  it("maps duplicate numbers and emails onto their fields and keeps the form", async () => {
    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    mockSearch = "employeeModal=create";
    rerender(<EmployeesPage />);

    expect(await screen.findByRole("heading", { name: "Add employee" })).toBeTruthy();

    createEmployeeMock.mockRejectedValueOnce(
      new ApiError(
        "EMPLOYEE_NUMBER_ALREADY_EXISTS",
        "An employee with this employee number already exists.",
        409,
      ),
    );

    fillCreateForm();
    await selectCreateOptions();
    fireEvent.click(screen.getByRole("button", { name: "Create employee" }));

    expect(
      await screen.findAllByText("An employee with this employee number already exists."),
    ).toBeTruthy();
    // Modal stays open with entered data intact.
    expect(screen.getByDisplayValue("EMP-1024")).toBeTruthy();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("keeps entered data on server failure and guards double submit", async () => {
    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    mockSearch = "employeeModal=create";
    rerender(<EmployeesPage />);

    expect(await screen.findByRole("heading", { name: "Add employee" })).toBeTruthy();

    let resolveCreate: ((value: EmployeeDetail) => void) | undefined;

    createEmployeeMock.mockImplementationOnce(
      () =>
        new Promise<EmployeeDetail>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    fillCreateForm();
    await selectCreateOptions();
    fireEvent.click(screen.getByRole("button", { name: "Create employee" }));

    const submit = (await screen.findByRole("button", {
      name: "Create employee",
    })) as HTMLButtonElement;

    expect(submit.disabled).toBe(true);

    fireEvent.click(submit);
    expect(createEmployeeMock).toHaveBeenCalledTimes(1);

    resolveCreate?.(detailFixture);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalled();
    });
  });

  it("edits through a prefilled modal and preserves directory filters on close", async () => {
    mockSearch = "search=ash&status=ACTIVE";

    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    updateEmployeeMock.mockImplementationOnce(async () => ({
      ...detailFixture,
      firstName: "Asha",
    }));

    mockSearch = "search=ash&status=ACTIVE&employeeModal=edit&employeeId=emp-1";
    rerender(<EmployeesPage />);

    expect(await screen.findByRole("heading", { name: "Edit employee" })).toBeTruthy();
    expect(await screen.findByDisplayValue("Olivia")).toBeTruthy();
    expect(screen.getByDisplayValue("PLD-004281")).toBeTruthy();

    fireEvent.change(screen.getByDisplayValue("Olivia"), { target: { value: "Asha" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateEmployeeMock).toHaveBeenCalledWith(
        "emp-1",
        expect.objectContaining({ firstName: "Asha", employeeNumber: "PLD-004281" }),
      );
    });

    // Only modal params are removed; directory state survives.
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/employees?search=ash&status=ACTIVE", {
        scroll: false,
      });
    });
  });

  it("keeps the edit modal open on validation failure", async () => {
    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    updateEmployeeMock.mockRejectedValueOnce(
      new ApiError(
        "INVALID_TERMINATION_DATE",
        "Termination date must be on or after the hire date.",
        400,
      ),
    );

    mockSearch = "employeeModal=edit&employeeId=emp-1";
    rerender(<EmployeesPage />);

    expect(await screen.findByRole("heading", { name: "Edit employee" })).toBeTruthy();

    fireEvent.change(await screen.findByLabelText(/Termination date/), {
      target: { value: "2020-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText("Termination date must be on or after the hire date."),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Edit employee" })).toBeTruthy();
  });

  it("deletes through confirmation and redirects nothing on the directory", async () => {
    const { rerender } = renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Delete Olivia Carter" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/dashboard/employees?employeeModal=delete&employeeId=emp-1",
      { scroll: false },
    );

    mockSearch = "employeeModal=delete&employeeId=emp-1";
    rerender(<EmployeesPage />);

    expect(await screen.findByText("Delete Olivia Carter?")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(deleteEmployeeMock).not.toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith("/dashboard/employees", { scroll: false });
  });

  it("rolls the row back when compensation protection conflicts", async () => {
    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    let rejectDelete: ((error: Error) => void) | undefined;

    deleteEmployeeMock.mockImplementationOnce(
      () =>
        new Promise<undefined>((_resolve, reject) => {
          rejectDelete = reject;
        }),
    );

    mockSearch = "employeeModal=delete&employeeId=emp-1";
    rerender(<EmployeesPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete employee" }));

    // Optimistic removal while the request is in flight.
    await waitFor(() => {
      expect(screen.queryByText("Olivia Carter")).toBeNull();
    });

    rejectDelete?.(
      new ApiError(
        "EMPLOYEE_HAS_COMPENSATION_HISTORY",
        "Employee cannot be deleted because compensation history exists.",
        409,
      ),
    );

    // Rollback: the row reappears, the dialog stays usable, no success path.
    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect(
      await screen.findByText(
        "This employee cannot be deleted because compensation history exists.",
      ),
    ).toBeTruthy();

    const lastReplace = replaceMock.mock.calls as unknown[][];
    const reopened = lastReplace.some(
      (call) => typeof call[0] === "string" && (call[0] as string).includes("employeeModal"),
    );

    expect(reopened).toBe(false);
    expect(deleteEmployeeMock).toHaveBeenCalledTimes(1);
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it("emits the employee-delete success toast only after API success", async () => {
    mockSearch = "employeeModal=delete&employeeId=emp-1";
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Delete employee" }));

    await waitFor(() => {
      expect(deleteEmployeeMock).toHaveBeenCalledTimes(1);
      expect(toastMock.success).toHaveBeenCalledWith("Employee deleted successfully.", {
        id: "employee-delete-emp-1",
      });
    });
  });

  it("guards the delete confirm against double submission", async () => {
    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    let resolveDelete: (() => void) | undefined;

    deleteEmployeeMock.mockImplementationOnce(
      () =>
        new Promise<undefined>((resolve) => {
          resolveDelete = () => resolve(undefined);
        }),
    );

    mockSearch = "employeeModal=delete&employeeId=emp-1";
    rerender(<EmployeesPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete employee" }));

    const confirm = (await screen.findByRole("button", {
      name: "Delete employee",
    })) as HTMLButtonElement;

    expect(confirm.disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    fireEvent.click(confirm);
    expect(deleteEmployeeMock).toHaveBeenCalledTimes(1);

    resolveDelete?.();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalled();
    });
  });

  it("ignores invalid modal URLs without a broken modal", async () => {
    mockSearch = "employeeModal=banana";

    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Add employee" })).toBeNull();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/employees", { scroll: false });
    });
  });

  it("ignores edit without an entity id", async () => {
    mockSearch = "search=ash&status=ACTIVE&employeeModal=edit";

    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Edit employee" })).toBeNull();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/employees?search=ash&status=ACTIVE", {
        scroll: false,
      });
    });
  });

  it("cleans delete without an entity id", async () => {
    mockSearch = "employeeModal=delete";
    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/employees", { scroll: false });
    });
  });

  it("ignores a create-mode stray id without loading detail", async () => {
    mockSearch = "employeeModal=create&employeeId=emp-1";
    renderPage();

    expect(await screen.findByRole("heading", { name: "Add employee" })).toBeTruthy();
    expect(fetchEmployeeMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/employees?employeeModal=create", {
        scroll: false,
      });
    });
  });

  it("clears stale modal state on organization switch", async () => {
    mockSearch = "employeeModal=edit&employeeId=emp-1";

    const { rerender } = renderPage();

    expect(await screen.findByRole("heading", { name: "Edit employee" })).toBeTruthy();

    mockedOrganizationId = "org-2";
    rerender(<EmployeesPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/employees", { scroll: false });
    });
  });

  it("closes a tenant-bound modal through Org A to unknown to Org B", async () => {
    mockSearch = "employeeModal=edit&employeeId=emp-1";
    const { rerender } = renderPage();

    expect(await screen.findByRole("heading", { name: "Edit employee" })).toBeTruthy();

    mockedRole = undefined;
    rerender(<EmployeesPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard/employees", { scroll: false });
    });

    mockedRole = "HR_MANAGER";
    mockedOrganizationId = "org-2";
    rerender(<EmployeesPage />);

    expect(screen.queryByRole("heading", { name: "Edit employee" })).toBeNull();
  });
});
