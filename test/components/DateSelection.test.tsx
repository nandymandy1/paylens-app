import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DatePicker from "@/components/ui/DatePicker";
import DateRangePicker from "@/components/ui/DateRangePicker";
import Rate from "@/components/ui/Rate";
import { normalizeDateRange } from "@/utils/date";

describe("date and selection primitives", () => {
  it("displays a selected date, clears it, and exposes an accessible trigger", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DatePicker label="Hire date" onChange={onChange} value="2026-09-17" />);

    expect(screen.getByRole("button", { name: /hire date: 17 Sep 2026/i })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Clear date" }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("selects only dates inside its configured minimum and maximum", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DatePicker
        label="Review date"
        maxDate="2026-09-30"
        minDate="2026-09-01"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /review date: select a date/i }));
    const disabledDay = screen.getByRole("button", {
      name: /august 31.*2026/i,
    });

    expect((disabledDay as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: /september 17.*2026/i }));
    expect(onChange).toHaveBeenCalledWith("2026-09-17");
  });

  it("supports partial and complete date ranges and clear behavior", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DateRangePicker
        label="Review period"
        onChange={onChange}
        value={{ endDate: "2026-09-30", startDate: "2026-09-17" }}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /review period: 17 Sep 2026 — 30 Sep 2026/i,
      }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Clear date range" }));
    expect(onChange).toHaveBeenCalledWith({});
    expect(normalizeDateRange({ endDate: "2026-09-17", startDate: "2026-09-30" })).toEqual({
      endDate: "2026-09-30",
      startDate: "2026-09-17",
    });
  });

  it("selects ratings through native radio controls and distinguishes disabled/read-only", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Rate aria-label="Quality" onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "4 of 5 stars" }));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "4 of 5 stars" }));

    rerender(<Rate aria-label="Quality" disabled value={3} />);
    expect((screen.getByRole("radio", { name: "3 of 5 stars" }) as HTMLInputElement).disabled).toBe(
      true,
    );
    rerender(<Rate aria-label="Quality" readOnly value={3} />);
    expect(screen.getByRole("img", { name: "Quality: 3 of 5" })).toBeDefined();
  });
});
