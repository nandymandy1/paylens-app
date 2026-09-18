"use client";

import Link from "next/link";
import type { FC } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import DataTable, { type DataTableColumn, type DataTableRow } from "@/components/ui/Table";
import type { EmployeeListItem } from "@/types/employee.type";
import { formatEnumLabel, getInitials } from "@/utils/string";

type EmployeesTableProps = {
  isLoading: boolean;
  hasActiveFilters: boolean;
  employees: EmployeeListItem[] | undefined;
  onClearFilters: () => void;
};

const columns: DataTableColumn[] = [
  { header: "Employee", id: "employee" },
  { header: "Employee ID", id: "employeeNumber" },
  { header: "Department", id: "department" },
  { header: "Job title", id: "jobTitle" },
  { header: "Location", id: "location" },
  { header: "Status", id: "status" },
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
  onClearFilters,
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
      },
      id: employee.id,
    })) ?? [];

  return (
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
  );
};

export default EmployeesTable;
