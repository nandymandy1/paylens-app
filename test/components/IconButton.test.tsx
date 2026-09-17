import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import IconButton from "@/components/ui/IconButton";

describe("IconButton", () => {
  it("exposes its required accessible name", () => {
    render(
      <IconButton
        aria-label="Open settings"
        icon={<span aria-hidden="true">x</span>}
      />,
    );

    expect(screen.getByRole("button", { name: "Open settings" })).toBeDefined();
  });
});
