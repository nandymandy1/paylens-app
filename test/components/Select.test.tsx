import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Select from "@/components/ui/Select";

const options = [
  { value: "manager", title: "HR Manager", subtitle: "Manage people" },
  { value: "viewer", title: "Viewer", subtitle: "Read-only access" },
  { value: "employee", title: "Employee", disabled: true },
] as const;

describe("Select", () => {
  it("renders a placeholder, invalid state, and selects an enabled option", () => {
    const onChange = vi.fn();

    render(
      <Select
        aria-label="Role"
        invalid
        onChange={onChange}
        options={options}
        placeholder="Select role"
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Role" });

    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.textContent).toContain("Select role");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: /HR Manager/i }));
    expect(onChange).toHaveBeenCalledWith("manager", options[0]);
  });

  it("supports controlled and disabled states", () => {
    render(
      <Select aria-label="Controlled role" disabled options={options} size="lg" value="manager" />,
    );
    const trigger = screen.getByRole("combobox", { name: "Controlled role" });

    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    expect(trigger.textContent).toContain("HR Manager");
    expect(trigger.className).toContain("h-11");
  });

  it("renders its default value in uncontrolled mode", () => {
    render(<Select aria-label="Default role" defaultValue="manager" options={options} />);

    expect(screen.getByRole("combobox", { name: "Default role" }).textContent).toContain(
      "HR Manager",
    );
  });

  it("updates the trigger after an uncontrolled selection", () => {
    const onChange = vi.fn();

    render(
      <Select
        aria-label="Uncontrolled role"
        defaultValue="manager"
        onChange={onChange}
        options={options}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Uncontrolled role" });

    expect(trigger.textContent).toContain("HR Manager");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: /Viewer/i }));

    expect(trigger.textContent).toContain("Viewer");
    expect(onChange).toHaveBeenCalledWith("viewer", options[1]);
  });
});
