"use client";

import type { FC } from "react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useDeleteEmployee, useEmployee } from "@/hooks/useEmployees";
import { ApiError } from "@/services/api";

type EmployeeDeleteDialogProps = {
  employeeId: string | null;
  onClose: () => void;
  onDeleted?: () => void;
};

const EmployeeDeleteDialog: FC<EmployeeDeleteDialogProps> = ({
  employeeId,
  onClose,
  onDeleted,
}) => {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const open = Boolean(employeeId);
  const detail = useEmployee(employeeId ?? "");
  const identity = detail.data
    ? `${detail.data.firstName} ${detail.data.lastName} (${detail.data.employeeNumber})`
    : "this employee";

  const close = () => {
    setDeleteError(null);
    onClose();
  };

  const remove = useDeleteEmployee(employeeId ?? "", {
    onError: (error) => {
      const message =
        error instanceof ApiError && error.code === "EMPLOYEE_HAS_COMPENSATION_HISTORY"
          ? "This employee cannot be deleted because compensation history exists."
          : "Employee could not be deleted. Try again.";

      setDeleteError(message);
    },
    onSuccess: () => {
      setDeleteError(null);

      if (onDeleted) {
        onDeleted();
      } else {
        onClose();
      }
    },
  });

  const confirm = () => {
    if (remove.isPending) {
      return;
    }

    setDeleteError(null);
    remove.mutate();
  };

  return (
    <Modal
      description="This action permanently removes the employee record. Employees with compensation history cannot be deleted."
      footer={
        <>
          <Button disabled={remove.isPending} onClick={close} variant="outline">
            Cancel
          </Button>
          <Button loading={remove.isPending} onClick={confirm}>
            Delete employee
          </Button>
        </>
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !remove.isPending) close();
      }}
      open={open}
      title={
        detail.data ? `Delete ${detail.data.firstName} ${detail.data.lastName}?` : "Delete employee"
      }
    >
      {detail.isPending ? (
        <div
          aria-label="Loading employee"
          className="h-10 animate-pulse rounded-sm bg-surface-subtle"
        />
      ) : (
        <p className="text-sm text-body">
          Employee: <span className="font-mono text-xs text-ink">{identity}</span>
        </p>
      )}
      {deleteError && (
        <Alert icon={<AlertCircle className="size-4" />} title="Delete failed" variant="danger">
          {deleteError}
        </Alert>
      )}
    </Modal>
  );
};

export default EmployeeDeleteDialog;
