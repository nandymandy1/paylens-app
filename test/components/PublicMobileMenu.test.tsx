import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LandingNav from "@/components/landing/LandingNav";
import PublicLayout from "@/components/layout/PublicLayout";

let sessionStatus: string = "anonymous";
let meData: { id: string } | undefined;

vi.mock("@/stores/theme", () => ({
  default: (selector: (state: { theme: string; toggleTheme: () => void }) => unknown) =>
    selector({ theme: "light", toggleTheme: vi.fn() }),
}));

vi.mock("@/stores/auth-session", () => ({
  default: (selector: (state: { status: string }) => unknown) =>
    selector({ status: sessionStatus }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useMe: () => ({ data: meData, isLoading: false }),
  useLogout: () => ({ mutate: vi.fn() }),
}));

describe("public mobile navigation", () => {
  it("landing header keeps desktop links and adds a mobile menu trigger", () => {
    sessionStatus = "anonymous";
    meData = undefined;

    render(<LandingNav />);

    expect(screen.getByRole("link", { name: "Product" })).toBeDefined();

    const trigger = screen.getByRole("button", { name: "Open menu" });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).toBe("public-mobile-menu");
  });

  it("opening the menu exposes every desktop link plus auth actions", () => {
    sessionStatus = "anonymous";
    meData = undefined;

    render(<LandingNav />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("button", { name: "Close menu" })).toBeDefined();

    for (const label of ["Product", "How it works", "Security", "Reviewer's Guide"]) {
      expect(screen.getByRole("link", { name: label })).toBeDefined();
    }

    expect(screen.getByRole("link", { name: "Sign in" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Get started" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeDefined();
  });

  it("selecting a link closes the menu", () => {
    sessionStatus = "anonymous";
    meData = undefined;

    render(<LandingNav />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByRole("link", { name: "Security" }));

    expect(screen.queryByRole("button", { name: "Close menu" })).toBeNull();
    expect(screen.getByRole("button", { name: "Open menu" })).toBeDefined();
  });

  it("authenticated menu exposes Dashboard and Sign out", () => {
    sessionStatus = "authenticated";
    meData = { id: "user-1" };

    render(<LandingNav />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeDefined();
    expect(screen.queryByRole("link", { name: "Get started" })).toBeNull();
  });

  it("docs layout exposes the same mobile menu trigger", () => {
    sessionStatus = "anonymous";
    meData = undefined;

    render(
      <PublicLayout>
        <div>Docs content</div>
      </PublicLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("link", { name: "Reviewer's Guide" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Sign in" })).toBeDefined();
  });
});
