"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { FC } from "react";
import { ArrowLeft } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { useEmployee } from "@/hooks/useEmployees";
import { formatDate } from "@/utils/date";
import { formatEnumLabel, getInitials } from "@/utils/string";

const EmployeeProfilePage: FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const employee = useEmployee(employeeId);

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-body underline-offset-4 hover:text-ink hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        href="/dashboard/employees"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Employees
      </Link>

      {employee.isPending && (
        <div aria-label="Loading employee" className="space-y-4">
          <div className="h-10 w-56 animate-pulse rounded-sm bg-surface-subtle" />
          <div className="h-64 animate-pulse rounded-sm border border-hairline bg-surface" />
        </div>
      )}

      {employee.isError && (
        <Card variant="soft">
          <Card.Content>
            <h1 className="text-xl font-medium tracking-tight">Employee not found</h1>
            <p className="mt-2 text-sm text-body">
              This employee is unavailable in your active organization.
            </p>
            <Link
              className="mt-5 inline-flex min-h-10 items-center rounded-sm border border-hairline px-4 text-sm font-medium text-ink hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              href="/dashboard/employees"
            >
              Return to employees
            </Link>
          </Card.Content>
        </Card>
      )}

      {employee.data && (
        <>
          <DashboardPageHeader
            eyebrow="Employee"
            title={`${employee.data.firstName} ${employee.data.lastName}`}
          />
          <Card>
            <Card.Content>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar
                  alt={`${employee.data.firstName} ${employee.data.lastName}`}
                  fallback={getInitials(employee.data.firstName, employee.data.lastName)}
                  size="lg"
                />
                <div>
                  <p className="text-lg font-medium">
                    {employee.data.firstName} {employee.data.lastName}
                  </p>
                  <p className="font-mono text-xs text-body">{employee.data.employeeNumber}</p>
                  <p className="text-sm text-body">{employee.data.workEmail ?? "—"}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <Badge variant={employee.data.status === "ACTIVE" ? "success" : "info"}>
                    {formatEnumLabel(employee.data.status)}
                  </Badge>
                </div>
              </div>
            </Card.Content>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <Card.Header>
                <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
                  Workforce
                </p>
              </Card.Header>
              <Card.Content>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Department</dt>
                    <dd>{employee.data.department.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Job title</dt>
                    <dd>{employee.data.jobTitle}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Level</dt>
                    <dd>{employee.data.level ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Country</dt>
                    <dd className="font-mono text-xs">{employee.data.countryCode}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Employment type</dt>
                    <dd>{formatEnumLabel(employee.data.employmentType)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Hire date</dt>
                    <dd>{formatDate(employee.data.hireDate)}</dd>
                  </div>
                </dl>
              </Card.Content>
            </Card>
            <Card>
              <Card.Header>
                <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
                  Current compensation
                </p>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-body">
                  Compensation will be available in the compensation workspace.
                </p>
              </Card.Content>
            </Card>
          </div>
        </>
      )}
    </section>
  );
};

export default EmployeeProfilePage;
