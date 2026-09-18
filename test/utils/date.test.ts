import { describe, expect, it } from "vitest";
import { formatDate, formatDateRange, isPastDate } from "@/utils/date";

describe("date utilities", () => {
  it("formats date-only and datetime inputs identically", () => {
    expect(formatDate("2026-01-05")).toBe("05 Jan 2026");
    expect(formatDate("2026-01-05T14:30:00.000Z")).toBe("05 Jan 2026");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });

  it("detects past dates", () => {
    expect(isPastDate("2000-01-01")).toBe(true);
    expect(isPastDate("2000-01-01T00:00:00.000Z")).toBe(true);
    expect(isPastDate("2999-01-01")).toBe(false);
    expect(isPastDate(undefined)).toBe(false);
  });

  it("formats ranges with the shared em-dash contract", () => {
    expect(formatDateRange({ startDate: "2026-01-01", endDate: "2026-01-05" })).toBe(
      "01 Jan 2026 — 05 Jan 2026",
    );
    expect(formatDateRange({ startDate: "2026-01-01" })).toBe("01 Jan 2026 — Select end date");
    expect(formatDateRange({})).toBe("");
  });
});
