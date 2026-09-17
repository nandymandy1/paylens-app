import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Avatar from "@/components/ui/Avatar";

describe("Avatar", () => {
  it("shows the fallback when an image fails", () => {
    render(
      <Avatar alt="Avery Johnson" fallback="AJ" src="/missing-person.png" />,
    );

    fireEvent.error(screen.getByAltText("Avery Johnson"));

    expect(screen.getByLabelText("Avery Johnson").textContent).toBe("AJ");
  });
});
