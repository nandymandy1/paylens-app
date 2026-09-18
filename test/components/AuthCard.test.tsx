import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AuthCard from "@/components/auth/AuthCard";

describe("AuthCard", () => {
  it("renders the shared PayLens brand panel and form content", () => {
    render(
      <AuthCard description="Sign in to your organization." eyebrow="Sign in" title="Welcome back">
        <button type="button">Continue with Google</button>
        <a href="/forgot-password">Forgot password?</a>
        <a href="/register">Create organization</a>
      </AuthCard>,
    );

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeDefined();
    expect(screen.getAllByRole("img", { name: "PayLens" })).toHaveLength(2);
    expect(screen.getByText("See the bigger picture in pay.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Create organization" })).toBeDefined();
  });
});
