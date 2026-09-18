import { describe, expect, it } from "vitest";
import { formatEnumLabel, getInitials } from "@/utils/string";

describe("getInitials", () => {
  it("produces canonical uppercase initials", () => {
    expect(getInitials("Narendra", "Maurya")).toBe("NM");
    expect(getInitials("Olivia", "Carter")).toBe("OC");
    expect(getInitials("  olivia ", " carter ")).toBe("OC");
  });

  it("handles empty values defensively", () => {
    expect(getInitials("", "")).toBe("");
    expect(getInitials("Olivia", "")).toBe("O");
  });
});

describe("formatEnumLabel", () => {
  it("replaces underscores while preserving casing", () => {
    expect(formatEnumLabel("TENANT_OWNER")).toBe("TENANT OWNER");
    expect(formatEnumLabel("ON_LEAVE")).toBe("ON LEAVE");
    expect(formatEnumLabel("FULL_TIME")).toBe("FULL TIME");
    expect(formatEnumLabel("ACTIVE")).toBe("ACTIVE");
  });
});
