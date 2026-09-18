import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PayLensLogo from "@/components/brand/PayLensLogo";

describe("PayLensLogo", () => {
  it("renders the accessible full PayLens logo", () => {
    render(<PayLensLogo theme="light" />);

    expect(screen.getByAltText("PayLens").getAttribute("src")).toBe(
      "/brand/paylens-logo-light.svg",
    );
  });

  it("renders the standalone mark and dark asset variant", () => {
    const { rerender } = render(<PayLensLogo variant="mark" />);

    expect(screen.getByAltText("PayLens").getAttribute("src")).toBe("/brand/paylens-mark.svg");

    rerender(<PayLensLogo theme="dark" variant="compact" />);
    expect(screen.getByAltText("PayLens").getAttribute("src")).toBe(
      "/brand/paylens-logo-compact-dark.svg",
    );
  });
});
