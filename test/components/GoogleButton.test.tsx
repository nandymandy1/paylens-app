import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GoogleButton from "@/components/auth/GoogleButton";

vi.mock("@/hooks/useAuth", () => ({
  useProviders: vi.fn(),
}));

const mockProviders = async (google: boolean) => {
  const { useProviders } = await import("@/hooks/useAuth");

  (useProviders as ReturnType<typeof vi.fn>).mockReturnValue({
    data: { google },
    isLoading: false,
  });
};

describe("GoogleButton", () => {
  it("renders nothing when Google is disabled", async () => {
    await mockProviders(false);

    const { container } = render(<GoogleButton />);

    expect(container.innerHTML).toBe("");
  });

  it("renders a text-only button when Google is enabled", async () => {
    await mockProviders(true);

    render(<GoogleButton />);

    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDefined();
  });
});
