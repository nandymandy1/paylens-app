import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FC, PropsWithChildren } from "react";
import DataTransferCenter from "@/components/transfers/DataTransferCenter";
import type { EmployeeExportJob } from "@/types/employee-transfer.type";

const spies = { pause: vi.fn(), cancel: vi.fn(), download: vi.fn() };
let mockedExports: EmployeeExportJob[] = [];

vi.mock("@/hooks/useEmployeeTransfer", () => ({
  useEmployeeExports: () => ({ data: mockedExports, isPending: false }),
  useEmployeeImports: () => ({ data: [], isPending: false }),
  usePauseExport: () => ({ mutate: spies.pause, isPending: false }),
  useResumeExport: () => ({ mutate: vi.fn(), isPending: false }),
  useCancelExport: () => ({ mutate: spies.cancel, isPending: false }),
  useDownloadExport: () => ({ mutate: spies.download, isPending: false }),
  useCreateExport: () => ({ mutate: vi.fn(), isPending: false }),
  usePauseImport: () => ({ mutate: vi.fn(), isPending: false }),
  useResumeImport: () => ({ mutate: vi.fn(), isPending: false }),
  useCancelImport: () => ({ mutate: vi.fn(), isPending: false }),
  useDownloadImportReport: () => ({ mutate: vi.fn(), isPending: false }),
}));

const job = (overrides: Partial<EmployeeExportJob> = {}): EmployeeExportJob => ({
  id: "exp-1",
  format: "XLSX",
  status: "PROCESSING",
  totalRows: 10_000,
  processedRows: 6_300,
  progressPercent: 63,
  fileName: null,
  createdAt: "2026-09-20T00:00:00.000Z",
  completedAt: null,
  errorCode: null,
  ...overrides,
});

const Wrapper: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const open = async (): Promise<void> => {
  await userEvent.setup().click(screen.getByRole("button", { name: "Open data transfers" }));
};

describe("dashboard Action Center", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedExports = [];
    sessionStorage.clear();
  });

  it("does not render a header trigger without active or recent work", () => {
    render(<DataTransferCenter />, { wrapper: Wrapper });
    expect(screen.queryByRole("button", { name: "Open data transfers" })).toBeNull();
  });

  it("shows compact progress and controls inside the dashboard dropdown", async () => {
    mockedExports = [job()];
    render(<DataTransferCenter />, { wrapper: Wrapper });
    await open();
    expect(screen.getByText("ACTIVE")).toBeDefined();
    expect(screen.getByText(/6,300 \/ 10,000/)).toBeDefined();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Pause export" }));
    await user.click(screen.getByRole("button", { name: "Cancel export" }));
    expect(spies.pause).toHaveBeenCalledWith("exp-1");
    expect(spies.cancel).toHaveBeenCalledWith("exp-1");
  });

  it("uses a count for multiple jobs instead of averaging progress", async () => {
    mockedExports = [job(), job({ id: "exp-2", progressPercent: 10 })];
    render(<DataTransferCenter />, { wrapper: Wrapper });
    expect(screen.getByText("2")).toBeDefined();
    await open();
    expect(screen.getByText("2 active transfers")).toBeDefined();
  });

  it("moves terminal work to Recent without an active badge and supports dismissal", async () => {
    mockedExports = [job({ status: "COMPLETED", progressPercent: 100 })];
    render(<DataTransferCenter />, { wrapper: Wrapper });
    expect(screen.queryByText("1")).toBeNull();
    await open();
    expect(screen.getByText("RECENT")).toBeDefined();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Download export" }));
    await user.click(screen.getByRole("button", { name: "Dismiss export" }));
    expect(spies.download).toHaveBeenCalledWith("exp-1");
    expect(screen.queryByRole("button", { name: "Open data transfers" })).toBeNull();
  });
});
