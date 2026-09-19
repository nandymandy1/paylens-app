import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthCard from "@/components/auth/AuthCard";
import { AUTH_ROUTES } from "@/utils/routes";

vi.mock("@/stores/theme", () => ({
  default: vi.fn(() => ({
    theme: "light" as const,
    toggleTheme: vi.fn(),
  })),
}));

describe("AuthCard", () => {
  it("renders the shared PayLens brand panel and form content", () => {
    render(
      <AuthCard description="Sign in to your organization." eyebrow="Sign in" title="Welcome back">
        <button type="button">Continue with Google</button>
        <a href={AUTH_ROUTES.forgotPassword}>Forgot password?</a>
        <a href={AUTH_ROUTES.register}>Create organization</a>
      </AuthCard>,
    );

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeDefined();

    const homeLinks = screen.getAllByRole("link", { name: "Go to PayLens home" });

    expect(homeLinks.length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText("See the bigger picture in pay.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Create organization" })).toBeDefined();
  });

  it("renders a theme toggle with accessible label", () => {
    render(
      <AuthCard eyebrow="Sign in" title="Welcome back">
        <div />
      </AuthCard>,
    );

    const toggle = screen.getByRole("button", { name: "Switch to dark mode" });

    expect(toggle).toBeDefined();
  });

  it("renders PayLens home link with accessible label", () => {
    render(
      <AuthCard eyebrow="Sign in" title="Welcome back">
        <div />
      </AuthCard>,
    );

    const homeLinks = screen.getAllByRole("link", { name: "Go to PayLens home" });

    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
  });
});
