import type { FC, ReactNode } from "react";
import cn from "@/utils/cn";

type DataTableColumn = {
  id: string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
};
type DataTableRow = {
  id: string;
  cells: Record<string, ReactNode>;
  className?: string;
  onClick?: () => void;
};
type DataTableProps = {
  ariaLabel: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  emptyState?: ReactNode;
  loading?: boolean;
};

const alignment = (align?: DataTableColumn["align"]) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
const DataTable: FC<DataTableProps> = ({
  ariaLabel,
  columns,
  emptyState,
  loading = false,
  rows,
}) => (
  <div className="w-full min-w-0 overflow-x-auto rounded-sm border border-hairline bg-surface">
    <table aria-label={ariaLabel} className="w-full min-w-[42rem] border-collapse text-sm">
      <thead className="bg-canvas-soft">
        <tr>
          {columns.map((column) => (
            <th
              className={cn(
                "h-11 px-4 font-mono text-[10px] font-medium tracking-[0.08em] text-body uppercase",
                alignment(column.align),
                column.className,
              )}
              key={column.id}
              scope="col"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {loading ? (
          <tr>
            <td className="h-20 px-4 text-body" colSpan={columns.length}>
              Loading data.
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td className="h-20 px-4 text-body" colSpan={columns.length}>
              {emptyState}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr
              className={cn(
                "h-16 transition-colors duration-150 hover:bg-canvas-soft",
                row.onClick && "cursor-pointer",
                row.className,
              )}
              key={row.id}
              onClick={row.onClick}
            >
              {columns.map((column) => (
                <td
                  className={cn("px-4", alignment(column.align), column.className)}
                  key={column.id}
                >
                  {row.cells[column.id]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;

export type { DataTableColumn, DataTableRow };
