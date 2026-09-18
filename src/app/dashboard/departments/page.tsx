"use client";

import Link from "next/link";
import { useState, type FC } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DepartmentsTable from "@/components/departments/DepartmentsTable";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useMe } from "@/hooks/useAuth";
import { useDepartmentList } from "@/hooks/useDepartments";
import { ApiError } from "@/services/api";
import { deleteDepartment, departmentKeys } from "@/services/department.service";
import { employeeKeys } from "@/services/employee.service";
import { EMPLOYEE_DIRECTORY_ROLES } from "@/types/employee.type";
import type { DepartmentSummary } from "@/types/department.type";
import { MEMBER_ADMIN_ROLES } from "@/types/organization.type";

const DepartmentsPage: FC = () => {
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;
  const activeRole = session?.activeMembership?.role;
  const canView = activeRole
    ? (EMPLOYEE_DIRECTORY_ROLES as readonly string[]).includes(activeRole)
    : false;
  const canManage = activeRole
    ? (MEMBER_ADMIN_ROLES as readonly string[]).includes(activeRole)
    : false;

  const departments = useDepartmentList({ enabled: canView });
  const [selected, setSelected] = useState<DepartmentSummary | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const closeDelete = () => {
    setSelected(null);
    setDeleteError(null);
  };

  const remove = useMutation({
    mutationFn: (departmentId: string) => deleteDepartment(departmentId),
    onError: (error) => {
      const message =
        error instanceof ApiError && error.code === "DEPARTMENT_IN_USE"
          ? "Department cannot be deleted while employees are assigned to it."
          : "Could not delete department. Try again.";

      setDeleteError(message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: departmentKeys.list(organizationId) });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.departments(organizationId) });
      toast.success("Department deleted");
      closeDelete();
    },
  });

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <DashboardPageHeader
        description="Organize your workforce into functional teams."
        eyebrow="Workforce"
        title="Departments"
        actions={
          canManage && (
            <Link href="/dashboard/departments/new">
              <Button prefixIcon={<Plus aria-hidden="true" className="size-4" />}>
                Add department
              </Button>
            </Link>
          )
        }
      />

      {!canView && (
        <Card variant="soft">
          <Card.Content>
            <p className="text-sm text-body">
              Your role cannot view departments. Contact your workspace administrator.
            </p>
          </Card.Content>
        </Card>
      )}

      {canView && (
        <>
          {departments.isError ? (
            <Card variant="soft">
              <Card.Content>
                <p className="text-sm text-body">We couldn&apos;t load departments.</p>
                <div className="mt-3">
                  <Button onClick={() => departments.refetch()} variant="outline">
                    Retry
                  </Button>
                </div>
              </Card.Content>
            </Card>
          ) : (
            <DepartmentsTable
              departments={departments.data}
              isLoading={departments.isPending}
              canManage={canManage}
              onDelete={(department) => {
                setDeleteError(null);
                setSelected(department);
              }}
            />
          )}
        </>
      )}

      <Modal
        description="Departments can only be deleted when no employees are assigned to them."
        footer={
          <>
            <Button onClick={closeDelete} variant="outline">
              Cancel
            </Button>
            <Button
              loading={remove.isPending}
              onClick={() => selected && remove.mutate(selected.id)}
            >
              Delete department
            </Button>
          </>
        }
        onOpenChange={(open) => {
          if (!open) closeDelete();
        }}
        open={selected !== null}
        title={selected ? `Delete ${selected.name}?` : "Delete department"}
      >
        {deleteError && (
          <Alert icon={<AlertCircle className="size-4" />} title="Delete failed" variant="danger">
            {deleteError}
          </Alert>
        )}
      </Modal>
    </section>
  );
};

export default DepartmentsPage;
