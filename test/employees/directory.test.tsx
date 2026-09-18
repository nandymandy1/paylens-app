import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmployeesPage from "@/app/dashboard/employees/page";
import type { EmployeeListItem } from "@/types/employee.type";
import type { OrganizationRole } from "@/types/organization.type";

let mockedRole: OrganizationRole | undefined = "HR_MANAGER";
let mockedOrganizationId = "org-1";
const replaceMock = vi.fn();
const pushMock = vi.fn();
let mockSearch = "";

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

type EmployeePage = {
  items: EmployeeListItem[];
  pageInfo: { nextCursor: string | null; hasNextPage: boolean };
};

const fetchEmployeesMock = vi.hoisted(() =>
  vi.fn(async (): Promise<EmployeePage> => ({
    items: [
      {
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
      },
    ],
    pageInfo: { nextCursor: null, hasNextPage: false },
  })),
);

vi.mock("@/services/employee.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/employee.service")>();

  return {
    ...actual,
    fetchEmployees: fetchEmployeesMock,
    fetchDepartments: vi.fn(async () => [{ id: "dept-eng", code: "ENG", name: "Engineering" }]),
  };
});

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return render(<EmployeesPage />, { wrapper: Wrapper });
};

const employeeFixture = {
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

describe("employee directory", () => {
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
  });

  it("renders search, filters, rows, and profile links without compensation", async () => {
    renderPage();

    expect(await screen.findByText("Employees")).toBeTruthy();
    expect(screen.getByPlaceholderText("Search name, email or employee ID")).toBeTruthy();
    expect(screen.getByLabelText("Department filter")).toBeTruthy();
    expect(screen.getByLabelText("Country filter")).toBeTruthy();
    expect(screen.getByLabelText("Status filter")).toBeTruthy();
    expect(screen.getByLabelText("Employment type filter")).toBeTruthy();
    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect(screen.getByText("PLD-004281")).toBeTruthy();
    // Compensation lives in the future compensation workspace, not the directory.
    expect(screen.queryByText("INR 1,850,000.00")).toBeNull();

    const profileLink = screen.getByText("Olivia Carter").closest("a");

    expect(profileLink?.getAttribute("href")).toBe("/dashboard/employees/emp-1");
  });

  it("hides the directory from EMPLOYEE roles without fetching", async () => {
    mockedRole = "EMPLOYEE";

    renderPage();

    expect(
      await screen.findByText(
        "Your role cannot view the employee directory. Contact your workspace administrator.",
      ),
    ).toBeTruthy();
    expect(fetchEmployeesMock).not.toHaveBeenCalled();
  });

  it("sends debounced search and resets cursor on filter change", async () => {
    fetchEmployeesMock
      .mockImplementationOnce(async () => ({
        items: [employeeFixture],
        pageInfo: { nextCursor: "cursor-1", hasNextPage: true },
      }))
      .mockImplementation(async () => ({
        items: [employeeFixture],
        pageInfo: { nextCursor: null, hasNextPage: false },
      }));

    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      const lastCall = (fetchEmployeesMock.mock.calls as unknown[][]).at(-1)?.[0] as {
        cursor?: string;
      };

      expect(lastCall.cursor).toBe("cursor-1");
    });

    fireEvent.change(screen.getByPlaceholderText("Search name, email or employee ID"), {
      target: { value: "olivia" },
    });

    await waitFor(
      () => {
        const lastCall = (fetchEmployeesMock.mock.calls as unknown[][]).at(-1)?.[0] as {
          cursor?: string;
          search?: string;
        };

        expect(lastCall.search).toBe("olivia");
        expect(lastCall.cursor).toBeUndefined();
      },
      { timeout: 2000 },
    );
  });

  it("never renders Org-A rows while an Org-B request is unresolved", async () => {
    const orgA = { ...employeeFixture, firstName: "Org", lastName: "Alpha" };
    let resolveOrgB: ((value: EmployeePage) => void) | undefined;

    fetchEmployeesMock.mockImplementation(() => {
      if (mockedOrganizationId === "org-1") {
        return Promise.resolve({
          items: [orgA],
          pageInfo: { nextCursor: null, hasNextPage: false },
        });
      }

      return new Promise<EmployeePage>((resolve) => {
        resolveOrgB = resolve;
      });
    });

    const { rerender } = renderPage();

    expect(await screen.findByText("Org Alpha")).toBeTruthy();

    mockedOrganizationId = "org-2";
    rerender(<EmployeesPage />);

    await waitFor(() => expect(fetchEmployeesMock).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("Org Alpha")).toBeNull();

    resolveOrgB?.({ items: [], pageInfo: { nextCursor: null, hasNextPage: false } });
  });

  it("does not reuse unfiltered rows for a pending search query", async () => {
    const unfiltered = { ...employeeFixture, firstName: "Unfiltered", lastName: "Row" };
    let resolvePending: ((value: EmployeePage) => void) | undefined;

    fetchEmployeesMock.mockImplementation((params?: { search?: string; sort?: string }) => {
      if (!params?.search && params?.sort === "lastName") {
        return Promise.resolve({
          items: [unfiltered],
          pageInfo: { nextCursor: null, hasNextPage: false },
        });
      }

      return new Promise<EmployeePage>((resolve) => {
        resolvePending = resolve;
      });
    });

    renderPage();
    expect(await screen.findByText("Unfiltered Row")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("Search name, email or employee ID"), {
      target: { value: "engineering" },
    });
    await waitFor(() => expect(fetchEmployeesMock).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("Unfiltered Row")).toBeNull();

    resolvePending?.({ items: [], pageInfo: { nextCursor: null, hasNextPage: false } });
  });

  it("does not reuse rows while a department filter request is unresolved", async () => {
    const unfiltered = { ...employeeFixture, firstName: "All", lastName: "Departments" };
    let resolveFiltered: ((value: EmployeePage) => void) | undefined;

    fetchEmployeesMock.mockImplementation((params?: { departmentId?: string }) => {
      if (!params?.departmentId) {
        return Promise.resolve({
          items: [unfiltered],
          pageInfo: { nextCursor: null, hasNextPage: false },
        });
      }

      return new Promise<EmployeePage>((resolve) => {
        resolveFiltered = resolve;
      });
    });

    renderPage();
    expect(await screen.findByText("All Departments")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Department filter"));
    fireEvent.click(await screen.findByRole("option", { name: "Engineering" }));

    await waitFor(() => expect(fetchEmployeesMock).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("All Departments")).toBeNull();
    resolveFiltered?.({ items: [], pageInfo: { nextCursor: null, hasNextPage: false } });
  });

  it("does not reuse rows while a sort request is unresolved", async () => {
    const nameSorted = { ...employeeFixture, firstName: "Name", lastName: "Sorted" };
    let resolveSorted: ((value: EmployeePage) => void) | undefined;

    fetchEmployeesMock.mockImplementation((params?: { sort?: string }) => {
      if (params?.sort === "lastName") {
        return Promise.resolve({
          items: [nameSorted],
          pageInfo: { nextCursor: null, hasNextPage: false },
        });
      }

      return new Promise<EmployeePage>((resolve) => {
        resolveSorted = resolve;
      });
    });

    renderPage();
    expect(await screen.findByText("Name Sorted")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Sort employees"));
    fireEvent.click(await screen.findByRole("option", { name: "Hire date" }));

    await waitFor(() => expect(fetchEmployeesMock).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("Name Sorted")).toBeNull();
    resolveSorted?.({ items: [], pageInfo: { nextCursor: null, hasNextPage: false } });
  });

  it("does not reuse rows while a sort-direction request is unresolved", async () => {
    const ascending = { ...employeeFixture, firstName: "Ascending", lastName: "Order" };
    let resolveDescending: ((value: EmployeePage) => void) | undefined;

    fetchEmployeesMock.mockImplementation((params?: { direction?: string }) => {
      if (params?.direction === "asc") {
        return Promise.resolve({
          items: [ascending],
          pageInfo: { nextCursor: null, hasNextPage: false },
        });
      }

      return new Promise<EmployeePage>((resolve) => {
        resolveDescending = resolve;
      });
    });

    renderPage();
    expect(await screen.findByText("Ascending Order")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Sort direction"));
    fireEvent.click(await screen.findByRole("option", { name: "Descending" }));

    await waitFor(() => expect(fetchEmployeesMock).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("Ascending Order")).toBeNull();
    resolveDescending?.({ items: [], pageInfo: { nextCursor: null, hasNextPage: false } });
  });

  it("navigates Next then Previous back to the first page", async () => {
    const empTwo = { ...employeeFixture, id: "emp-2", firstName: "Emp", lastName: "Two" };

    fetchEmployeesMock.mockImplementation(async (params?: { cursor?: string }) => {
      if (!params?.cursor) {
        return {
          items: [employeeFixture],
          pageInfo: { nextCursor: "cursor-1", hasNextPage: true },
        };
      }

      return { items: [empTwo], pageInfo: { nextCursor: null, hasNextPage: false } };
    });

    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Emp Two")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
    // Last page: Next is disabled when the API reports no next cursor.
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
    // The current cursor survives refresh/deep-link through the URL.
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("cursor=cursor-1"),
      expect.anything(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(pushMock).toHaveBeenCalledWith("/dashboard/employees?sort=lastName&direction=asc", {
      scroll: false,
    });
  });

  it("ignores repeated Next/Previous while a cursor transition is in flight", async () => {
    const empTwo = { ...employeeFixture, id: "emp-2", firstName: "Emp", lastName: "Two" };
    let resolvePageTwo: ((page: EmployeePage) => void) | undefined;

    fetchEmployeesMock.mockImplementation(async (params?: { cursor?: string }) => {
      if (!params?.cursor) {
        return {
          items: [employeeFixture],
          pageInfo: { nextCursor: "cursor-1", hasNextPage: true },
        };
      }

      return new Promise<EmployeePage>((resolve) => {
        resolvePageTwo = resolve;
      });
    });

    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    // The page-2 request is now in flight with placeholder data: both
    // navigation buttons must be disabled until it resolves.
    await waitFor(() => {
      expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(
        true,
      );
      expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(
        true,
      );
    });

    const cursorCalls = () =>
      (fetchEmployeesMock.mock.calls as unknown[][]).filter(
        (call) => (call[0] as { cursor?: string }).cursor === "cursor-1",
      ).length;

    expect(cursorCalls()).toBe(1);

    // fireEvent dispatches even on disabled buttons, so these clicks prove the
    // handler-level guard (not just the disabled UI) blocks a second transition.
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(cursorCalls()).toBe(1);

    resolvePageTwo?.({ items: [empTwo], pageInfo: { nextCursor: null, hasNextPage: false } });
    expect(await screen.findByText("Emp Two")).toBeTruthy();
    expect(cursorCalls()).toBe(1);

    // The stack holds exactly one transition: Previous returns to page 1.
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("walks three pages forward and back with correct cursors", async () => {
    const empTwo = { ...employeeFixture, id: "emp-2", firstName: "Emp", lastName: "Two" };
    const empThree = { ...employeeFixture, id: "emp-3", firstName: "Emp", lastName: "Three" };
    const pages: Record<string, EmployeePage> = {
      "": {
        items: [employeeFixture],
        pageInfo: { nextCursor: "cursor-1", hasNextPage: true },
      },
      "cursor-1": {
        items: [empTwo],
        pageInfo: { nextCursor: "cursor-2", hasNextPage: true },
      },
      "cursor-2": { items: [empThree], pageInfo: { nextCursor: null, hasNextPage: false } },
    };

    fetchEmployeesMock.mockImplementation(
      async (params?: { cursor?: string }) => pages[params?.cursor ?? ""] ?? pages[""],
    );

    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Emp Two")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Emp Three")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("Emp Two")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("Olivia Carter")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    const cursors = (fetchEmployeesMock.mock.calls as unknown[][]).map(
      (call) => (call[0] as { cursor?: string }).cursor,
    );

    expect(cursors[0]).toBeUndefined();
    expect(cursors).toContain("cursor-1");
    expect(cursors).toContain("cursor-2");
  });

  it("resets pagination when search changes from a later page", async () => {
    const empTwo = { ...employeeFixture, id: "emp-2", firstName: "Emp", lastName: "Two" };

    fetchEmployeesMock.mockImplementation(async (params?: { cursor?: string }) => {
      if (!params?.cursor) {
        return {
          items: [employeeFixture],
          pageInfo: { nextCursor: "cursor-1", hasNextPage: true },
        };
      }

      return { items: [empTwo], pageInfo: { nextCursor: null, hasNextPage: false } };
    });

    renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Emp Two")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(
      false,
    );

    fireEvent.change(screen.getByPlaceholderText("Search name, email or employee ID"), {
      target: { value: "olivia" },
    });

    await waitFor(
      () => {
        const lastCall = (fetchEmployeesMock.mock.calls as unknown[][]).at(-1)?.[0] as {
          cursor?: string;
          search?: string;
        };

        expect(lastCall.search).toBe("olivia");
        expect(lastCall.cursor).toBeUndefined();
      },
      { timeout: 2000 },
    );
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("restores the cursor page from the URL on load", async () => {
    mockSearch = "cursor=cursor-1";

    const empTwo = { ...employeeFixture, id: "emp-2", firstName: "Emp", lastName: "Two" };

    fetchEmployeesMock.mockImplementation(async (params?: { cursor?: string }) =>
      params?.cursor === "cursor-1"
        ? { items: [empTwo], pageInfo: { nextCursor: null, hasNextPage: false } }
        : { items: [employeeFixture], pageInfo: { nextCursor: "cursor-1", hasNextPage: true } },
    );

    renderPage();

    expect(await screen.findByText("Emp Two")).toBeTruthy();
    // Opaque history cannot be reconstructed: resume forward-only.
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    const firstCall = (fetchEmployeesMock.mock.calls as unknown[][])[0]?.[0] as {
      cursor?: string;
    };

    expect(firstCall.cursor).toBe("cursor-1");
  });

  it("adopts browser navigation state from the URL", async () => {
    const { rerender } = renderPage();

    expect(await screen.findByText("Olivia Carter")).toBeTruthy();

    mockSearch = "search=olivia";
    rerender(<EmployeesPage />);

    await waitFor(
      () => {
        const lastCall = (fetchEmployeesMock.mock.calls as unknown[][]).at(-1)?.[0] as {
          search?: string;
        };

        expect(lastCall.search).toBe("olivia");
      },
      { timeout: 2000 },
    );
  });

  it("shows empty states with clear filters and an error state with retry", async () => {
    fetchEmployeesMock.mockImplementationOnce(async () => ({
      items: [],
      pageInfo: { nextCursor: null, hasNextPage: false },
    }));

    const { unmount } = renderPage();

    expect(await screen.findByText("No employees yet.")).toBeTruthy();

    fetchEmployeesMock.mockImplementationOnce(async () => ({
      items: [],
      pageInfo: { nextCursor: null, hasNextPage: false },
    }));

    fireEvent.change(screen.getByPlaceholderText("Search name, email or employee ID"), {
      target: { value: "zzz" },
    });

    expect(await screen.findByText(/No employees match these filters\./)).toBeTruthy();
    // Both the filter toolbar and the table empty state offer the reset action.
    expect(screen.getAllByRole("button", { name: "Clear filters" }).length).toBeGreaterThanOrEqual(
      1,
    );

    unmount();
    vi.clearAllMocks();
    fetchEmployeesMock.mockImplementationOnce(async () => {
      throw new Error("boom");
    });

    renderPage();

    expect(await screen.findByText("We couldn't load employees.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
