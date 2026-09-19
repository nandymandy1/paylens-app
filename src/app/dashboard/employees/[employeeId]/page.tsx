"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, type FC } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmployeeDeleteDialog from "@/components/employees/EmployeeDeleteDialog";
import EmployeeFormModal from "@/components/employees/EmployeeFormModal";
import CompensationModal from "@/components/compensation/CompensationModal";
import CompensationTimeline from "@/components/compensation/CompensationTimeline";
import { useMe } from "@/hooks/useAuth";
import { useCompensationHistory, useCurrentCompensation } from "@/hooks/useCompensation";
import { useCrudModal } from "@/hooks/useCrudModalParams";
import { useEmployee } from "@/hooks/useEmployees";
import { EMPLOYEE_WRITE_ROLES } from "@/types/employee.type";
import { formatDate } from "@/utils/date";
import { formatEnumLabel, getInitials } from "@/utils/string";
import { formatMoneyString } from "@/utils/number";

const EmployeeProfileContent: FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const employee = useEmployee(employeeId);
  const yearsOfService = useMemo(() => {
    if (!employee.data) return null;

    const started = new Date(`${employee.data.hireDate}T00:00:00.000Z`);
    const ended = employee.data.terminationDate
      ? new Date(`${employee.data.terminationDate}T00:00:00.000Z`)
      : new Date();
    let years = ended.getUTCFullYear() - started.getUTCFullYear();
    const anniversaryHasPassed =
      ended.getUTCMonth() > started.getUTCMonth() ||
      (ended.getUTCMonth() === started.getUTCMonth() && ended.getUTCDate() >= started.getUTCDate());

    if (!anniversaryHasPassed) years -= 1;

    return Math.max(0, years);
  }, [employee.data]);
  const { data: session } = useMe();
  const activeRole = session?.activeMembership?.role;
  const canManage = activeRole
    ? (EMPLOYEE_WRITE_ROLES as readonly string[]).includes(activeRole)
    : false;
  const canViewCompensation = activeRole
    ? (["TENANT_OWNER", "HR_ADMIN", "HR_MANAGER", "VIEWER_AUDITOR"] as const).includes(
        activeRole as never,
      )
    : false;
  const compensation = useCurrentCompensation(employeeId, canViewCompensation);
  const history = useCompensationHistory(employeeId, canViewCompensation);
  const rawCompensationModal = searchParams.get("compensationModal");
  const compensationMode =
    rawCompensationModal === "set" || rawCompensationModal === "change"
      ? rawCompensationModal
      : null;
  const updateCompensationModal = useCallback(
    (mode: "set" | "change" | null, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());

      if (mode) params.set("compensationModal", mode);
      else params.delete("compensationModal");
      const href = `/dashboard/employees/${employeeId}${params.size ? `?${params}` : ""}`;

      if (replace) router.replace(href);
      else router.push(href);
    },
    [employeeId, router, searchParams],
  );
  const historyItems = history.data?.pages.flatMap((page) => page.items) ?? [];
  const hasNextHistory = Boolean(history.data?.pages.at(-1)?.pageInfo.hasNextPage);

  useEffect(() => {
    if (!rawCompensationModal || compensation.isPending || compensation.isError) return;
    const expectedMode = compensation.data ? "change" : "set";

    if (rawCompensationModal !== expectedMode) updateCompensationModal(expectedMode, true);
  }, [
    compensation.data,
    compensation.isError,
    compensation.isPending,
    rawCompensationModal,
    updateCompensationModal,
  ]);

  const modal = useCrudModal({
    modalKey: "employeeModal",
    idKey: "employeeId",
    allowed: ["edit", "delete"],
    organizationId: session?.activeOrganization?.id,
  });

  // Profile modals always target the profile employee: a foreign deep-link ID
  // resolves through the tenant-safe detail query and shows Load failed.
  const modalEmployeeId = modal.entityId ?? (modal.mode ? employeeId : null);

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
            actions={
              canManage && (
                <span className="flex gap-2">
                  <Button
                    prefixIcon={<Pencil aria-hidden="true" className="size-4" />}
                    variant="outline"
                    onClick={() => modal.openEntity("edit", employee.data.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    prefixIcon={<Trash2 aria-hidden="true" className="size-4" />}
                    variant="outline"
                    onClick={() => modal.openEntity("delete", employee.data.id)}
                  >
                    Delete
                  </Button>
                </span>
              )
            }
          />
          <Card className="relative overflow-hidden">
            {/* Subtle gradient accent strip */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#FC4C02_0%,#EF2CC1_35%,#BDBBFF_65%,#3455FF_100%)]"
            />
            <Card.Content>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Avatar
                  alt={`${employee.data.firstName} ${employee.data.lastName}`}
                  fallback={getInitials(employee.data.firstName, employee.data.lastName)}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="text-lg font-medium text-ink">
                    {employee.data.firstName} {employee.data.lastName}
                  </p>
                  <p className="font-mono text-xs text-body">{employee.data.employeeNumber}</p>
                  <p className="text-sm text-body">{employee.data.workEmail ?? "—"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
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
                <p className="font-mono text-[10px] font-medium tracking-[0.08em] text-body/60 uppercase">
                  Workforce
                </p>
              </Card.Header>
              <Card.Content>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Department</dt>
                    <dd className="text-right font-medium text-ink">
                      {employee.data.department.name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Job title</dt>
                    <dd className="text-right font-medium text-ink">{employee.data.jobTitle}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Level</dt>
                    <dd className="text-right font-medium text-ink">
                      {employee.data.level ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Country</dt>
                    <dd className="font-mono text-xs text-right">{employee.data.countryCode}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Employment type</dt>
                    <dd className="text-right text-ink">
                      {formatEnumLabel(employee.data.employmentType)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Hire date</dt>
                    <dd className="text-right text-ink">{formatDate(employee.data.hireDate)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Years of service</dt>
                    <dd className="text-right text-ink">
                      {yearsOfService === 1 ? "1 year" : `${yearsOfService ?? 0} years`}
                    </dd>
                  </div>
                </dl>
              </Card.Content>
            </Card>
            <Card className="relative overflow-hidden">
              {/* Compensation card accent */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#FC4C02_0%,#EF2CC1_35%,#BDBBFF_65%,#3455FF_100%)]"
              />
              <Card.Header className="pt-2">
                <p className="font-mono text-[10px] font-medium tracking-[0.08em] text-body/60 uppercase">
                  Current compensation
                </p>
              </Card.Header>
              <Card.Content>
                {!canViewCompensation && (
                  <p className="text-sm text-body">Compensation is restricted for your role.</p>
                )}
                {canViewCompensation && compensation.isPending && (
                  <div
                    aria-label="Loading compensation"
                    className="h-16 animate-pulse rounded-sm bg-surface-subtle"
                  />
                )}
                {canViewCompensation && compensation.isError && (
                  <div>
                    <p className="text-sm text-body">Unable to load compensation.</p>
                    <Button
                      className="mt-3"
                      variant="outline"
                      onClick={() => compensation.refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                )}
                {canViewCompensation &&
                  !compensation.isPending &&
                  !compensation.isError &&
                  !compensation.data && (
                    <>
                      <p className="text-sm text-body">
                        No compensation has been set for this employee.
                      </p>
                      {canManage && (
                        <Button className="mt-4" onClick={() => updateCompensationModal("set")}>
                          Set compensation
                        </Button>
                      )}
                    </>
                  )}
                {canViewCompensation && compensation.data && (
                  <>
                    <p className="comp-amount text-2xl font-semibold tracking-tight text-ink">
                      {formatMoneyString(
                        compensation.data.annualBaseSalary,
                        compensation.data.currency,
                      )}
                    </p>
                    <p className="mt-1.5 text-sm text-body">
                      Effective from {formatDate(compensation.data.effectiveFrom)}
                    </p>
                    {canManage && (
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => updateCompensationModal("change")}
                      >
                        Change compensation
                      </Button>
                    )}
                  </>
                )}
              </Card.Content>
            </Card>
          </div>
          {canViewCompensation && (
            <Card>
              <Card.Header>
                <p className="font-mono text-[10px] font-medium tracking-[0.08em] text-body/60 uppercase">
                  Compensation history
                </p>
              </Card.Header>
              <Card.Content>
                {history.isPending && (
                  <div
                    aria-label="Loading compensation history"
                    className="h-20 animate-pulse rounded-sm bg-surface-subtle"
                  />
                )}
                {history.isError && (
                  <div>
                    <p className="text-sm text-body">Unable to load compensation history.</p>
                    <Button className="mt-3" variant="outline" onClick={() => history.refetch()}>
                      Retry
                    </Button>
                  </div>
                )}
                {history.data &&
                  (historyItems.length ? (
                    <CompensationTimeline items={historyItems} />
                  ) : (
                    <p className="text-sm text-body">No compensation history yet.</p>
                  ))}
                {hasNextHistory && (
                  <Button
                    className="mt-4"
                    disabled={history.isFetchingNextPage}
                    variant="outline"
                    onClick={() => history.fetchNextPage()}
                  >
                    {history.isFetchingNextPage
                      ? "Loading earlier history..."
                      : "Load earlier history"}
                  </Button>
                )}
              </Card.Content>
            </Card>
          )}
        </>
      )}

      <EmployeeFormModal
        mode={modal.mode === "edit" ? "edit" : null}
        employeeId={modalEmployeeId}
        onClose={modal.close}
      />
      <EmployeeDeleteDialog
        employeeId={modal.mode === "delete" ? modalEmployeeId : null}
        onClose={modal.close}
        onDeleted={() => router.replace("/dashboard/employees")}
      />
      <CompensationModal
        mode={compensationMode}
        employeeId={employeeId}
        current={compensation.data}
        onClose={() => updateCompensationModal(null, true)}
        onVersionConflict={() => {
          compensation.refetch();
          history.refetch();
        }}
      />
    </section>
  );
};

const EmployeeProfilePage: FC = () => (
  <Suspense fallback={<p className="text-sm text-body">Loading employee.</p>}>
    <EmployeeProfileContent />
  </Suspense>
);

export default EmployeeProfilePage;
