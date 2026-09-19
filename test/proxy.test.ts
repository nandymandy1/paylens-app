import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";

describe("dashboard proxy", () => {
  it("does not depend on an API-hosted session cookie", () => {
    const request = new NextRequest("https://app.example.test/dashboard/members");

    expect(proxy(request)).toBeUndefined();
  });
});
