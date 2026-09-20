import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FC, PropsWithChildren } from "react";
import EmployeeImportWizard from "@/components/transfers/EmployeeImportWizard";

const startMock = vi.fn();

vi.mock("@/hooks/useEmployeeTransfer", () => ({
  useStartImport: () => ({ mutate: startMock, isPending: false }),
  useConfirmImport: () => ({ mutate: vi.fn(), isPending: false }),
  useDownloadImportReport: () => ({ mutate: vi.fn(), isPending: false }),
  useEmployeeImportJob: () => ({ data: null }),
}));

const Wrapper: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe("employee import file picker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a styled picker instead of a raw file input", () => {
    render(
      <Wrapper>
        <EmployeeImportWizard open onClose={() => undefined} />
      </Wrapper>,
    );

    expect(screen.getByRole("button", { name: "Choose file" })).toBeDefined();
    expect(screen.getByText("No file chosen")).toBeDefined();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;

    expect(input?.className).toContain("hidden");
  });

  it("rejects non-CSV/XLSX files with a clear error", async () => {
    render(
      <Wrapper>
        <EmployeeImportWizard open onClose={() => undefined} />
      </Wrapper>,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const bad = new File(["x"], "notes.txt", { type: "text/plain" });

    // Bypass the accept filter (user-event filters by accept; a dropped or
    // renamed file can still reach the handler, which must reject it).
    fireEvent.change(input, { target: { files: [bad] } });

    expect(await screen.findByText("Only .csv and .xlsx files are accepted.")).toBeDefined();
    expect(startMock).not.toHaveBeenCalled();
  });

  it("starts the presigned upload for a valid CSV", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <EmployeeImportWizard open onClose={() => undefined} />
      </Wrapper>,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const good = new File(["Employee Number\nEMP-1\n"], "employees.csv", { type: "text/csv" });

    await user.upload(input, good);

    expect(await screen.findByText(/employees\.csv/)).toBeDefined();

    await user.click(screen.getByRole("button", { name: /upload and validate/i }));
    expect(startMock).toHaveBeenCalledTimes(1);
    expect((startMock.mock.calls[0] as File[])[0].name).toBe("employees.csv");
  });
});
