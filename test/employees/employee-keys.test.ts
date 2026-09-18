import { describe, expect, it } from "vitest";
import { employeeKeys } from "@/services/employee.service";
import { formatCompensation, formatMoneyString } from "@/utils/number";

describe("employee formatting and query keys", () => {
  it("formats decimal salary strings without float conversion", () => {
    expect(formatMoneyString("1850000.00", "INR")).toBe("INR 1,850,000.00");
    expect(formatMoneyString("128000.00", "USD")).toBe("USD 128,000.00");
    expect(formatMoneyString("0.10", "USD")).toBe("USD 0.10");
    expect(formatMoneyString("1850000", "INR")).toBe("INR 1,850,000.00");
  });

  it("renders an em dash when compensation is missing", () => {
    expect(formatCompensation(null)).toBe("—");
    expect(formatCompensation({ annualBaseSalary: "128000.00", currency: "USD" })).toBe(
      "USD 128,000.00",
    );
  });

  it("scopes list and detail cache keys by active organization", () => {
    const params = { direction: "asc", limit: 25, sort: "lastName" } as const;
    const orgA = employeeKeys.list("org-a", params);
    const orgB = employeeKeys.list("org-b", params);

    expect(orgA).not.toEqual(orgB);
    expect(employeeKeys.detail("org-a", "emp-1")).toEqual([
      "employees",
      "org-a",
      "detail",
      "emp-1",
    ]);
    expect(employeeKeys.detail("org-a", "emp-1")).not.toEqual(
      employeeKeys.detail("org-b", "emp-1"),
    );
  });
});
