import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Alert from "@/components/ui/Alert";

describe("Alert", () => {
  it("uses an assertive alert role for danger feedback", () => {
    render(<Alert variant="danger">Resolve the conflict.</Alert>);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("danger");
    expect(alert.textContent).toContain("Resolve the conflict.");
  });
});
