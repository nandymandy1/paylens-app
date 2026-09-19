"use client";

import Link from "next/link";
import type { FC } from "react";
import { Pencil, Trash2 } from "lucide-react";
import DataTable, { type DataTableColumn, type DataTableRow } from "@/components/ui/Table";
import type { DepartmentSummary } from "@/types/department.type";
import { formatDate } from "@/utils/date";

type DepartmentsTableProps = {
  departments: DepartmentSummary[] | undefined;
  isLoading: boolean;
  canManage: boolean;
  onEdit: (department: DepartmentSummary) => void;
  onDelete: (department: DepartmentSummary) => void;
};

const columns: DataTableColumn[] = [
  { header: "Department", id: "department" },
  { header: "Code", id: "code" },
  { align: "right", header: "Employees", id: "employees" },
  { header: "Created", id: "created" },
  { align: "right", header: "Actions", id: "actions" },
];

const DepartmentsTable: FC<DepartmentsTableProps> = ({
  departments,
  isLoading,
  canManage,
  onEdit,
  onDelete,
}) => {
  const rows: DataTableRow[] =
    departments?.map((department) => ({
      cells: {
        department: (
          <Link
            className="font-medium text-ink underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            href={`/dashboard/employees?departmentId=${department.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            {department.name}
          </Link>
        ),
        code: <span className="dept-code-badge">{department.code}</span>,
        employees: (
          <Link
            className="font-mono text-xs tabular-nums text-ink underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            href={`/dashboard/employees?departmentId=${department.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            {department.employeeCount.toLocaleString("en-US")}
          </Link>
        ),
        created: <span className="text-sm text-body">{formatDate(department.createdAt)}</span>,
        actions: canManage ? (
          <span className="flex items-center justify-end gap-0.5">
            <button
              aria-label={`Edit ${department.name}`}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-body transition-[background-color,color] duration-150 hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(department);
              }}
              type="button"
            >
              <Pencil aria-hidden="true" className="size-3.5" />
            </button>
            <button
              aria-label={`Delete ${department.name}`}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-body transition-[background-color,color] duration-150 hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(department);
              }}
              type="button"
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
            </button>
          </span>
        ) : (
          <span className="text-xs text-body">—</span>
        ),
      },
      id: department.id,
    })) ?? [];

  return (
    <div className="rounded-md border border-hairline bg-surface shadow-soft">
      <DataTable
        rows={rows}
        columns={columns}
        loading={isLoading}
        ariaLabel="Organization departments"
        emptyState="No departments yet."
      />
    </div>
  );
};

export default DepartmentsTable;
