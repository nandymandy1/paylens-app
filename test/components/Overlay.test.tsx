import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Button from "@/components/ui/Button";
import Popover from "@/components/ui/Popover";
import Tooltip from "@/components/ui/Tooltip";

describe("overlay primitives", () => {
  it("opens popover content from the keyboard", async () => {
    const user = userEvent.setup();

    render(
      <Popover content="Review details">
        <Button>Open review</Button>
      </Popover>,
    );

    await user.tab();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Review details")).toBeDefined();
  });

  it("reveals tooltip content on focus", async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Helpful context" delayDuration={0}>
        <Button>Need help</Button>
      </Tooltip>,
    );

    await user.tab();

    expect((await screen.findByRole("tooltip")).textContent).toContain("Helpful context");
  });
});
