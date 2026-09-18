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
  onDelete,
}) => {
  const rows: DataTableRow[] =
    departments?.map((department) => ({
      cells: {
        department: (
          <Link
            className="font-medium text-ink hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            href={`/dashboard/employees?departmentId=${department.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            {department.name}
          </Link>
        ),
        code: <span className="font-mono text-xs text-body">{department.code}</span>,
        employees: (
          <Link
            className="font-mono text-xs text-ink hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            href={`/dashboard/employees?departmentId=${department.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            {department.employeeCount.toLocaleString("en-US")}
          </Link>
        ),
        created: <span className="text-body">{formatDate(department.createdAt)}</span>,
        actions: canManage ? (
          <span className="flex items-center justify-end gap-1">
            <Link
              aria-label={`Edit ${department.name}`}
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-sm text-body hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              href={`/dashboard/departments/${department.id}/edit`}
              onClick={(event) => event.stopPropagation()}
            >
              <Pencil aria-hidden="true" className="size-4" />
            </Link>
            <button
              aria-label={`Delete ${department.name}`}
              className="inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-sm text-body hover:bg-canvas-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(department);
              }}
              type="button"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </span>
        ) : (
          <span className="text-xs text-body">—</span>
        ),
      },
      id: department.id,
    })) ?? [];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      loading={isLoading}
      ariaLabel="Organization departments"
      emptyState="No departments yet."
    />
  );
};

export default DepartmentsTable;
