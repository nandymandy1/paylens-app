"use client";

import Link from "next/link";
import type { FC } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import DataTable, { type DataTableColumn, type DataTableRow } from "@/components/ui/Table";
import type { EmployeeListItem } from "@/types/employee.type";
import { formatEnumLabel, getInitials } from "@/utils/string";

type EmployeesTableProps = {
  isLoading: boolean;
  hasActiveFilters: boolean;
  employees: EmployeeListItem[] | undefined;
  canManage: boolean;
  onClearFilters: () => void;
  onEdit: (employee: EmployeeListItem) => void;
  onDelete: (employee: EmployeeListItem) => void;
};

const columns: DataTableColumn[] = [
  { header: "Employee", id: "employee" },
  { header: "Employee ID", id: "employeeNumber" },
  { header: "Department", id: "department" },
  { header: "Job title", id: "jobTitle" },
  { header: "Location", id: "location" },
  { header: "Status", id: "status" },
  { align: "right", header: "Actions", id: "actions" },
];

const statusVariant = (status: string) => {
  if (status === "ACTIVE") {
    return "success" as const;
  }

  if (status === "ON_LEAVE") {
    return "warning" as const;
  }

  return "info" as const;
};

const EmployeesTable: FC<EmployeesTableProps> = ({
  employees,
  isLoading,
  hasActiveFilters,
  canManage,
  onClearFilters,
  onEdit,
  onDelete,
}) => {
  const rows: DataTableRow[] =
    employees?.map((employee) => ({
      cells: {
        employee: (
          <Link
            className="flex min-w-52 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            href={`/dashboard/employees/${employee.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <Avatar
              alt={`${employee.firstName} ${employee.lastName}`}
              fallback={getInitials(employee.firstName, employee.lastName)}
              size="md"
            />
            <span>
              <span className="block font-medium text-ink">
                {employee.firstName} {employee.lastName}
              </span>
              <span className="block text-xs text-body">{employee.workEmail ?? "—"}</span>
            </span>
          </Link>
        ),
        employeeNumber: (
          <span className="font-mono text-xs text-body">{employee.employeeNumber}</span>
        ),
        department: <span className="text-ink">{employee.department.name}</span>,
        jobTitle: (
          <span>
            <span className="block text-ink">{employee.jobTitle}</span>
            {employee.level && <span className="block text-xs text-body">{employee.level}</span>}
          </span>
        ),
        location: <span className="font-mono text-xs text-body">{employee.countryCode}</span>,
        status: (
          <Badge variant={statusVariant(employee.status)}>{formatEnumLabel(employee.status)}</Badge>
        ),
        actions: canManage ? (
          <span className="flex items-center justify-end gap-0.5">
            <Link
              aria-label={`View ${employee.firstName} ${employee.lastName}`}
              className="inline-flex size-8 items-center justify-center rounded-md text-body transition-[background-color,color] duration-150 hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              href={`/dashboard/employees/${employee.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              <Eye aria-hidden="true" className="size-3.5" />
            </Link>
            <button
              aria-label={`Edit ${employee.firstName} ${employee.lastName}`}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-body transition-[background-color,color] duration-150 hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(employee);
              }}
              type="button"
            >
              <Pencil aria-hidden="true" className="size-3.5" />
            </button>
            <button
              aria-label={`Delete ${employee.firstName} ${employee.lastName}`}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-body transition-[background-color,color] duration-150 hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(employee);
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
      id: employee.id,
    })) ?? [];

  return (
    <div className="rounded-md border border-hairline bg-surface shadow-soft">
      <DataTable
        rows={rows}
        columns={columns}
        loading={isLoading}
        ariaLabel="Organization employees"
        emptyState={
          hasActiveFilters ? (
            <span>
              No employees match these filters.{" "}
              <button
                className="font-medium text-ink underline underline-offset-4"
                onClick={onClearFilters}
                type="button"
              >
                Clear filters
              </button>
            </span>
          ) : (
            "No employees yet."
          )
        }
      />
    </div>
  );
};

export default EmployeesTable;
