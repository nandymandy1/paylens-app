import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import InputOTP from "@/components/ui/InputOTP";
import InputPassword from "@/components/ui/InputPassword";
import { Radio, RadioGroup } from "@/components/ui/Radio";
import Switch from "@/components/ui/Switch";

describe("form controls", () => {
  it("links input label, help, and error state", () => {
    render(
      <Input
        error="Use a unique name."
        helpText="This appears in reports."
        label="Report name"
      />,
    );

    const input = screen.getByLabelText("Report name");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("-help");
    expect(screen.getByText("Use a unique name.")).toBeTruthy();
  });

  it("toggles password visibility without losing the input", () => {
    render(<InputPassword label="Password" value="secret" readOnly />);

    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeTruthy();
  });

  it("distributes a pasted OTP value across slots", () => {
    const onChange = vi.fn();
    render(<InputOTP label="Code" length={4} onChange={onChange} />);

    fireEvent.paste(screen.getByLabelText("Code digit 1 of 4"), {
      clipboardData: { getData: () => "1234" },
    });

    expect(onChange).toHaveBeenLastCalledWith("1234");
  });

  it("supports checkbox interaction and indeterminate state", () => {
    render(<Checkbox indeterminate label="Select records" />);

    const checkbox = screen.getByLabelText(
      "Select records",
    ) as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("changes selected radio value", () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup label="Access" name="access" onValueChange={onValueChange}>
        <Radio label="Manager" value="manager" />
        <Radio label="Viewer" value="viewer" />
      </RadioGroup>,
    );

    fireEvent.click(screen.getByLabelText("Viewer"));
    expect(onValueChange).toHaveBeenCalledWith("viewer");
  });

  it("exposes native switch state and honors disabled", () => {
    const onChange = vi.fn();
    render(<Switch label="Notifications" onChange={onChange} />);
    const toggle = screen.getByRole("switch", { name: "Notifications" });
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalled();

    render(<Switch disabled label="Locked notifications" />);
    expect(
      screen.getByRole("switch", { name: "Locked notifications" }),
    ).toHaveProperty("disabled", true);
  });
});
