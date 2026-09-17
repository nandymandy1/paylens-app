import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import Modal from "@/components/ui/Modal";
import Paginator from "@/components/ui/Paginator";
import Segment from "@/components/ui/Segment";
import Tabs from "@/components/ui/Tabs";
import { getPaginationItems } from "@/utils/pagination";

describe("interaction primitives", () => {
  it("opens an accordion item and keeps disabled items unavailable", async () => {
    const user = userEvent.setup();

    render(
      <Accordion
        items={[
          { content: "Visible details", title: "Details", value: "details" },
          {
            content: "Locked",
            disabled: true,
            title: "Locked",
            value: "locked",
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText("Visible details")).toBeDefined();
    expect((screen.getByRole("button", { name: "Locked" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("switches tabs and respects disabled tabs", async () => {
    const user = userEvent.setup();

    render(
      <Tabs
        defaultValue="one"
        items={[
          { content: "First panel", label: "First", value: "one" },
          { content: "Second panel", label: "Second", value: "two" },
          { content: "", disabled: true, label: "Locked", value: "three" },
        ]}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByText("Second panel")).toBeDefined();
    expect((screen.getByRole("tab", { name: "Locked" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("changes segment selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Segment
        aria-label="View"
        defaultValue="table"
        onValueChange={onValueChange}
        options={[
          { label: "Table", value: "table" },
          { label: "Review", value: "review" },
        ]}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "Review" }));
    expect(onValueChange).toHaveBeenCalledWith("review");
    expect((screen.getByRole("radio", { name: "Review" }) as HTMLInputElement).checked).toBe(true);
  });

  it("opens and closes a modal with an accessible dialog", async () => {
    const user = userEvent.setup();

    render(
      <Modal title="Review details" trigger={<Button>Open modal</Button>}>
        Modal content
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Open modal" }));
    expect(screen.getByRole("dialog", { name: "Review details" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens and closes a drawer", async () => {
    const user = userEvent.setup();

    render(
      <Drawer title="Context" trigger={<Button>Open drawer</Button>}>
        Drawer content
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    expect(screen.getByRole("dialog", { name: "Context" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Close drawer" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("indicates the current paginator page and limits navigation at edges", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Paginator onPageChange={onPageChange} page={1} totalPages={100} />,
    );

    expect(
      (
        screen.getByRole("button", {
          name: "Previous page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe(
      "page",
    );
    await user.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(<Paginator onPageChange={onPageChange} page={100} totalPages={100} />);
    expect((screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("builds a stable large-page window", () => {
    expect(getPaginationItems(50, 100)).toEqual([1, "ellipsis", 49, 50, 51, "ellipsis", 100]);
  });
});
