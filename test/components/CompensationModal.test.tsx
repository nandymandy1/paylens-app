import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CompensationModal from "@/components/compensation/CompensationModal";

const mutate = vi.fn();

vi.mock("@/hooks/useCompensation", () => ({
  useChangeCompensation: vi.fn(() => ({ mutate, isPending: false, error: null })),
}));

const renderModal = (mode: "set" | "change") =>
  render(
    <CompensationModal
      current={
        mode === "change"
          ? {
              employeeId: "employee-1",
              annualBaseSalary: "100000.00",
              currency: "USD",
              effectiveFrom: "2025-01-01",
              version: 1,
            }
          : null
      }
      employeeId="employee-1"
      mode={mode}
      onClose={vi.fn()}
      onVersionConflict={vi.fn()}
    />,
  );

describe("CompensationModal", () => {
  it.each(["set", "change"] as const)("submits a valid %s compensation form", async (mode) => {
    mutate.mockClear();
    renderModal(mode);
    fireEvent.change(screen.getByLabelText(/Annual base salary/i), {
      target: { value: "120000.00" },
    });
    fireEvent.change(screen.getByLabelText(/Effective from/i), { target: { value: "2026-01-01" } });

    const submit = screen.getByRole("button", {
      name: mode === "set" ? "Set compensation" : "Change compensation",
    });

    expect(submit.getAttribute("type")).toBe("submit");
    fireEvent.click(submit);
    await waitFor(() => expect(mutate).toHaveBeenCalledOnce());
  });
});
