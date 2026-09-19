import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PublicLayout from "@/components/layout/PublicLayout";

vi.mock("@/stores/theme", () => ({
  default: vi.fn(() => ({
    theme: "light" as const,
    toggleTheme: vi.fn(),
  })),
}));

vi.mock("@/stores/auth-session", () => ({
  default: vi.fn(() => ({
    status: "anonymous" as const,
  })),
  useAuthSessionStore: vi.fn(() => ({
    status: "anonymous" as const,
  })),
}));

vi.mock("@/hooks/useAuth", () => ({
  useMe: vi.fn(() => ({ data: undefined, isLoading: false })),
  useLogout: vi.fn(() => ({ mutate: vi.fn() })),
}));

describe("PublicLayout", () => {
  it("renders canonical navbar with all required links", () => {
    render(
      <PublicLayout>
        <div>Page content</div>
      </PublicLayout>,
    );

    const homeLinks = screen.getAllByRole("link", { name: "Go to PayLens home" });

    expect(homeLinks.length).toBeGreaterThanOrEqual(1);

    const productLink = screen.getByRole("link", { name: "Product" });

    expect(productLink.getAttribute("href")).toBe("/home#product");

    const howItWorksLink = screen.getByRole("link", { name: "How it works" });

    expect(howItWorksLink.getAttribute("href")).toBe("/home#how-it-works");

    const securityLink = screen.getByRole("link", { name: "Security" });

    expect(securityLink.getAttribute("href")).toBe("/home#security");

    const signInLinks = screen.getAllByRole("link", { name: "Sign in" });

    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    expect(signInLinks[0].getAttribute("href")).toBe("/auth/login");

    const getStartedLinks = screen.getAllByRole("link", { name: "Get started" });

    expect(getStartedLinks.length).toBeGreaterThanOrEqual(1);
    expect(getStartedLinks[0].getAttribute("href")).toBe("/auth/register");
  });

  it("renders a theme toggle with accessible label", () => {
    render(
      <PublicLayout>
        <div>Page content</div>
      </PublicLayout>,
    );

    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeDefined();
  });

  it("renders page content", () => {
    render(
      <PublicLayout>
        <div>Page content</div>
      </PublicLayout>,
    );

    expect(screen.getByText("Page content")).toBeDefined();
  });

  it("renders the shared footer", () => {
    render(
      <PublicLayout>
        <div>Page content</div>
      </PublicLayout>,
    );

    expect(screen.getByText("Compensation operations, made clear.")).toBeDefined();
  });
});
