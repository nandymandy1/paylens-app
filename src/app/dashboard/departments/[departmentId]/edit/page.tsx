"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DepartmentForm from "@/components/departments/DepartmentForm";
import Card from "@/components/ui/Card";
import { useMe } from "@/hooks/useAuth";
import { useDepartment } from "@/hooks/useDepartments";
import { ApiError } from "@/services/api";
import { departmentKeys, updateDepartment } from "@/services/department.service";
import { employeeKeys } from "@/services/employee.service";
import type { DepartmentInput } from "@/types/department.type";
import { MEMBER_ADMIN_ROLES } from "@/types/organization.type";

const EditDepartmentPage: FC = () => {
  const router = useRouter();
  const { data: session } = useMe();
  const queryClient = useQueryClient();
  const { departmentId } = useParams<{ departmentId: string }>();
  const [serverError, setServerError] = useState<string | null>(null);

  const organizationId = session?.activeOrganization?.id;
  const activeRole = session?.activeMembership?.role;
  const canManage = activeRole
    ? (MEMBER_ADMIN_ROLES as readonly string[]).includes(activeRole)
    : false;

  const department = useDepartment(departmentId, { enabled: canManage });

  const save = useMutation({
    mutationFn: (input: DepartmentInput) => updateDepartment(departmentId, input),
    onError: (error) => {
      setServerError(
        error instanceof ApiError && error.code === "DEPARTMENT_CODE_ALREADY_EXISTS"
          ? "A department with this code already exists."
          : "Could not save department. Try again.",
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: departmentKeys.list(organizationId) });
      await queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(organizationId, departmentId),
      });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.departments(organizationId) });
      toast.success("Department saved");
      router.push("/dashboard/departments");
    },
  });

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <DashboardPageHeader
        description="Update the department name or code."
        eyebrow="Workforce"
        title="Edit department"
      />

      {!canManage ? (
        <Card variant="soft">
          <Card.Content>
            <p className="text-sm text-body">
              Your role cannot manage departments. Contact your workspace administrator.
            </p>
          </Card.Content>
        </Card>
      ) : department.isPending ? (
        <div aria-label="Loading department" className="w-full max-w-2xl space-y-4">
          <div className="h-64 animate-pulse rounded-sm border border-hairline bg-surface" />
        </div>
      ) : department.isError || !department.data ? (
        <Card variant="soft">
          <Card.Content>
            <h1 className="text-xl font-medium tracking-tight">Department not found</h1>
            <p className="mt-2 text-sm text-body">
              This department is unavailable in your active organization.
            </p>
            <Link
              className="mt-5 inline-flex min-h-10 items-center rounded-sm border border-hairline px-4 text-sm font-medium text-ink hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              href="/dashboard/departments"
            >
              Return to departments
            </Link>
          </Card.Content>
        </Card>
      ) : (
        <div className="w-full max-w-2xl">
          <Card>
            <Card.Content>
              <DepartmentForm
                defaultValues={{ code: department.data.code, name: department.data.name }}
                isPending={save.isPending}
                serverError={serverError}
                submitLabel="Save changes"
                onSubmit={(input) => {
                  setServerError(null);
                  save.mutate(input);
                }}
              />
              <div className="mt-4">
                <Link
                  className="inline-flex min-h-10 items-center rounded-sm border border-hairline px-4 text-sm font-medium text-ink hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  href="/dashboard/departments"
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

export default EditDepartmentPage;
