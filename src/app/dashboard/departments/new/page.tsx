"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type FC } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DepartmentForm from "@/components/departments/DepartmentForm";
import Card from "@/components/ui/Card";
import { useMe } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { createDepartment, departmentKeys } from "@/services/department.service";
import { employeeKeys } from "@/services/employee.service";
import type { DepartmentInput } from "@/types/department.type";
import { MEMBER_ADMIN_ROLES } from "@/types/organization.type";
import { getSafeInternalPath } from "@/utils/navigation";

/** Internal dashboard paths only: onboarding links back here with return_to. */
const asSafeReturnTo = (value: string | null): string | null =>
  getSafeInternalPath(value, ["/dashboard"]);

const NewDepartmentPage: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;
  const activeRole = session?.activeMembership?.role;
  const canManage = activeRole
    ? (MEMBER_ADMIN_ROLES as readonly string[]).includes(activeRole)
    : false;

  const returnTo = useMemo(() => asSafeReturnTo(searchParams.get("return_to")), [searchParams]);
  const cancelHref = returnTo ?? "/dashboard/departments";
  const [serverError, setServerError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (input: DepartmentInput) => createDepartment(input),
    onError: (error) => {
      setServerError(
        error instanceof ApiError && error.code === "DEPARTMENT_CODE_ALREADY_EXISTS"
          ? "A department with this code already exists."
          : "Could not create department. Try again.",
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: departmentKeys.list(organizationId) });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.departments(organizationId) });
      toast.success("Department created");
      router.push(returnTo ?? "/dashboard/departments");
    },
  });

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <DashboardPageHeader
        description="Add a team to your organization."
        eyebrow="Workforce"
        title="New department"
      />

      {!canManage ? (
        <Card variant="soft">
          <Card.Content>
            <p className="text-sm text-body">
              Your role cannot manage departments. Contact your workspace administrator.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="w-full max-w-2xl">
          <Card>
            <Card.Content>
              <DepartmentForm
                isPending={create.isPending}
                serverError={serverError}
                submitLabel="Create department"
                onSubmit={(input) => {
                  setServerError(null);
                  create.mutate(input);
                }}
              />
              <div className="mt-4">
                <Link
                  className="inline-flex min-h-10 items-center rounded-sm border border-hairline px-4 text-sm font-medium text-ink hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  href={cancelHref}
                >
                  Cancel
                </Link>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </section>
  );
};

const NewDepartmentRoute: FC = () => (
  <Suspense fallback={<p className="text-sm text-body">Loading.</p>}>
    <NewDepartmentPage />
  </Suspense>
);

export default NewDepartmentRoute;
