import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FC, PropsWithChildren } from "react";
import EmployeeExportMenu from "@/components/transfers/EmployeeExportMenu";

const createMock = vi.fn();

vi.mock("@/hooks/useEmployeeTransfer", () => ({
  useCreateExport: () => ({ mutate: createMock, isPending: false }),
}));

const createClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const Wrapper: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={createClient()}>{children}</QueryClientProvider>
);

describe("employee export menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens CSV and XLSX options and creates the chosen format", async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <EmployeeExportMenu />
      </Wrapper>,
    );

    await user.click(screen.getByRole("button", { name: /export/i }));

    await user.click(screen.getByRole("button", { name: /export csv/i }));
    expect(createMock).toHaveBeenCalledWith("CSV");

    await user.click(screen.getByRole("button", { name: /export/i }));
    await user.click(screen.getByRole("button", { name: /excel/i }));
    expect(createMock).toHaveBeenCalledWith("XLSX");
  });
});
