import { describe, expect, it } from "vitest";
import { transferKeys } from "@/services/employee-transfer.service";
import { isExportActive, isImportActive } from "@/types/employee-transfer.type";

describe("employee transfer cache keys and activity", () => {
  it("scopes transfer keys by active organization", () => {
    expect(transferKeys.exports("org-a")).toEqual(["employee-exports", "org-a"]);
    expect(transferKeys.exports("org-a")).not.toEqual(transferKeys.exports("org-b"));
    expect(transferKeys.imports("org-a")).toEqual(["employee-imports", "org-a"]);
    expect(transferKeys.exportDetail("org-a", "exp-1")).toEqual([
      "employee-exports",
      "org-a",
      "exp-1",
    ]);
    expect(transferKeys.exportDetail("org-a", "exp-1")).not.toEqual(
      transferKeys.exportDetail("org-b", "exp-1"),
    );
  });

  it("uses domain roots covered by logout/org-switch clearing", () => {
    expect(transferKeys.exports("org-a")[0]).toBe("employee-exports");
    expect(transferKeys.imports("org-a")[0]).toBe("employee-imports");
  });

  it("treats only non-terminal export states as active", () => {
    for (const status of ["QUEUED", "PROCESSING", "PAUSING", "CANCELLING", "FINALIZING"] as const) {
      expect(isExportActive(status)).toBe(true);
    }

    for (const status of ["PAUSED", "CANCELLED", "COMPLETED", "FAILED", "EXPIRED"] as const) {
      expect(isExportActive(status)).toBe(false);
    }
  });

  it("treats only non-terminal import states as active", () => {
    for (const status of [
      "QUEUED",
      "VALIDATING",
      "PAUSING",
      "APPLY_QUEUED",
      "APPLYING",
      "CANCELLING",
    ] as const) {
      expect(isImportActive(status)).toBe(true);
    }

    for (const status of [
      "AWAITING_UPLOAD",
      "PAUSED",
      "READY_FOR_REVIEW",
      "CANCELLED",
      "CANCELLED_PARTIAL",
      "COMPLETED",
      "COMPLETED_WITH_ERRORS",
      "FAILED",
      "EXPIRED",
    ] as const) {
      expect(isImportActive(status)).toBe(false);
    }
  });
});
