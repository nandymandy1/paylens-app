"use client";

import { Suspense, type FC } from "react";
import { Plus } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DepartmentDeleteModal from "@/components/departments/DepartmentDeleteModal";
import DepartmentFormModal from "@/components/departments/DepartmentFormModal";
import DepartmentsTable from "@/components/departments/DepartmentsTable";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useMe } from "@/hooks/useAuth";
import { useCrudModal } from "@/hooks/useCrudModalParams";
import { useDepartmentList } from "@/hooks/useDepartments";
import { EMPLOYEE_DIRECTORY_ROLES } from "@/types/employee.type";
import { MEMBER_ADMIN_ROLES } from "@/types/organization.type";

const DepartmentsContent: FC = () => {
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
  const modal = useCrudModal({
    modalKey: "departmentModal",
    idKey: "departmentId",
    allowed: ["create", "edit", "delete"],
    organizationId,
  });

  const formMode = modal.mode === "create" || modal.mode === "edit" ? modal.mode : null;
  const deleteId = modal.mode === "delete" ? modal.entityId : null;
  const deleteName = departments.data?.find((item) => item.id === deleteId)?.name;

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <DashboardPageHeader
        description="Organize your workforce into functional teams."
        eyebrow="Workforce"
        title="Departments"
        actions={
          canManage && (
            <Button
              prefixIcon={<Plus aria-hidden="true" className="size-4" />}
              onClick={modal.openCreate}
            >
              Add department
            </Button>
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
              onEdit={(department) => modal.openEntity("edit", department.id)}
              onDelete={(department) => modal.openEntity("delete", department.id)}
            />
          )}
        </>
      )}

      <DepartmentFormModal mode={formMode} departmentId={modal.entityId} onClose={modal.close} />
      <DepartmentDeleteModal
        departmentId={deleteId}
        fallbackName={deleteName}
        onClose={modal.close}
      />
    </section>
  );
};

const DepartmentsPage: FC = () => (
  <Suspense fallback={<p className="text-sm text-body">Loading departments.</p>}>
    <DepartmentsContent />
  </Suspense>
);

export default DepartmentsPage;
