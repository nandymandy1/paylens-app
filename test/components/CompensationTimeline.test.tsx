import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CompensationTimeline from "@/components/compensation/CompensationTimeline";
import type { CompensationHistoryItem } from "@/types/compensation.type";

const item = (overrides: Partial<CompensationHistoryItem> = {}): CompensationHistoryItem => ({
  id: "history-2",
  version: 2,
  previousAnnualBaseSalary: "100000.00",
  newAnnualBaseSalary: "115000.00",
  previousCurrency: "USD",
  newCurrency: "USD",
  previousEffectiveFrom: "2025-01-01",
  effectiveFrom: "2026-01-01",
  reason: "ANNUAL_REVIEW",
  note: "Strong performance",
  changedBy: { id: "user-1", firstName: "Narendra", lastName: "Maurya" },
  createdAt: "2026-01-01T09:00:00.000Z",
  ...overrides,
});

describe("CompensationTimeline", () => {
  it("expands the latest event, supports collapse controls, and renders the money delta", () => {
    render(<CompensationTimeline items={[item(), item({ id: "history-1", version: 1 })]} />);

    expect(screen.getAllByText("+USD 15,000.00 (+15.00%)")).toHaveLength(2);
    expect(screen.getByText("Strong performance")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Hide" })[0]);
    expect(screen.queryByText("Strong performance")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Expand all" }));
    expect(screen.getAllByRole("button", { name: "Hide" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(screen.getAllByRole("button", { name: "Details" })).toHaveLength(2);
  });

  it("renders initial and cross-currency events without a fictional percentage", () => {
    render(
      <CompensationTimeline
        items={[
          item({ previousCurrency: "USD", newCurrency: "INR", note: null }),
          item({
            id: "history-1",
            version: 1,
            previousAnnualBaseSalary: null,
            reason: "INITIAL",
            changedBy: null,
          }),
        ]}
      />,
    );

    expect(screen.getByText("Currency changed")).toBeTruthy();
    expect(screen.getByText(/Initial/)).toBeTruthy();
    expect(screen.getByText(/Changed by Unavailable/)).toBeTruthy();
    expect(screen.queryByText(/Infinity/)).toBeNull();
  });
});
