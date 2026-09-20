import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FC, PropsWithChildren } from "react";
import DataTransferCenter from "@/components/transfers/DataTransferCenter";
import type { EmployeeExportJob } from "@/types/employee-transfer.type";

const spies = {
  pause: vi.fn(),
  resume: vi.fn(),
  cancel: vi.fn(),
  download: vi.fn(),
  create: vi.fn(),
};

let mockedExports: EmployeeExportJob[] = [];

vi.mock("@/hooks/useEmployeeTransfer", () => ({
  useEmployeeExports: () => ({ data: mockedExports, isPending: false }),
  useEmployeeImports: () => ({ data: [], isPending: false }),
  usePauseExport: () => ({ mutate: spies.pause, isPending: false }),
  useResumeExport: () => ({ mutate: spies.resume, isPending: false }),
  useCancelExport: () => ({ mutate: spies.cancel, isPending: false }),
  useDownloadExport: () => ({ mutate: spies.download, isPending: false }),
  useCreateExport: () => ({ mutate: spies.create, isPending: false }),
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

describe("floating data transfer center", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedExports = [];
  });

  it("renders nothing without jobs", () => {
    const { container } = render(
      <Wrapper>
        <DataTransferCenter />
      </Wrapper>,
    );

    expect(container.firstChild).toBeNull();
  });

  it("shows pause and cancel while processing", async () => {
    mockedExports = [job()];

    render(
      <Wrapper>
        <DataTransferCenter />
      </Wrapper>,
    );

    expect(await screen.findByText(/6,300 \/ 10,000/)).toBeDefined();

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Pause export" }));
    expect(spies.pause).toHaveBeenCalledWith("exp-1");

    await user.click(screen.getByRole("button", { name: "Cancel export" }));
    expect(spies.cancel).toHaveBeenCalledWith("exp-1");
    expect(screen.queryByRole("button", { name: "Download export" })).toBeNull();
  });

  it("shows resume and cancel while paused", async () => {
    mockedExports = [job({ status: "PAUSED" })];

    render(
      <Wrapper>
        <DataTransferCenter />
      </Wrapper>,
    );

    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Resume export" }));
    expect(spies.resume).toHaveBeenCalledWith("exp-1");
    expect(screen.queryByRole("button", { name: "Pause export" })).toBeNull();
  });

  it("shows no controls while finalizing and download when ready", async () => {
    mockedExports = [job({ status: "FINALIZING" })];

    const { rerender } = render(
      <Wrapper>
        <DataTransferCenter />
      </Wrapper>,
    );

    expect(await screen.findByText(/finalizing/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Pause export" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel export" })).toBeNull();

    mockedExports = [job({ status: "COMPLETED" })];
    rerender(
      <Wrapper>
        <DataTransferCenter />
      </Wrapper>,
    );

    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Download export" }));
    expect(spies.download).toHaveBeenCalledWith("exp-1");
  });

  it("retries failed exports as a new job and hides download when expired", async () => {
    mockedExports = [
      job({ status: "FAILED", format: "CSV", errorCode: "EMPLOYEE_EXPORT_WORKER_FAILED" }),
    ];

    render(
      <Wrapper>
        <DataTransferCenter />
      </Wrapper>,
    );

    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Retry export" }));
    expect(spies.create).toHaveBeenCalledWith("CSV");
    expect(screen.queryByRole("button", { name: "Download export" })).toBeNull();

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeDefined();
    });
  });

  it("collapses and expands from the floating bar", async () => {
    mockedExports = [job()];

    render(
      <Wrapper>
        <DataTransferCenter />
      </Wrapper>,
    );

    const user = userEvent.setup();

    expect(await screen.findByText(/6,300 \/ 10,000/)).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Collapse transfers" }));
    expect(screen.queryByText(/6,300 \/ 10,000/)).toBeNull();

    await user.click(screen.getByRole("button", { name: "Expand transfers" }));
    expect(await screen.findByText(/6,300 \/ 10,000/)).toBeDefined();
  });
});
