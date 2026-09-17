import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";

const requestFor = (path: string, hint?: string): NextRequest => {
  const request = new NextRequest(`http://localhost${path}`);

  if (hint) {
    request.cookies.set("paylens_session_hint", hint);
  }

  return request;
};

describe("dashboard proxy", () => {
  it("redirects unauthenticated dashboard access to login with redirect_to", () => {
    const response = proxy(requestFor("/dashboard/members"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?redirect_to=%2Fdashboard%2Fmembers");
  });

  it("lets hinted requests through to backend-guarded routes", () => {
    const response = proxy(requestFor("/dashboard", "1"));

    expect(response.headers.get("location")).toBeNull();
  });
});
