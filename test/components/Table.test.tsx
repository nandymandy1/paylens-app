import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DataTable from "@/components/ui/Table";

const columns = [
  { header: "Member", id: "member" },
  { header: "Status", id: "status" },
];

describe("DataTable", () => {
  it("uses semantic table markup for product data", () => {
    const { container } = render(
      <DataTable
        ariaLabel="Member directory"
        columns={columns}
        rows={[{ cells: { member: "Avery Johnson", status: "ACTIVE" }, id: "m-1" }]}
      />,
    );

    expect(screen.getByRole("table", { name: "Member directory" })).toBeDefined();
    expect(container.querySelector("thead")).not.toBeNull();
    expect(container.querySelector("tbody")).not.toBeNull();
    expect(container.querySelectorAll("th")).toHaveLength(2);
    expect(container.querySelectorAll("td")).toHaveLength(2);
  });

  it("renders shared loading and empty states", () => {
    const { rerender } = render(
      <DataTable ariaLabel="Loading members" columns={columns} loading rows={[]} />,
    );

    expect(screen.getByText("Loading data.")).toBeDefined();

    rerender(
      <DataTable
        ariaLabel="Empty members"
        columns={columns}
        emptyState="No members found."
        rows={[]}
      />,
    );
    expect(screen.getByText("No members found.")).toBeDefined();
  });
});
