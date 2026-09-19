"use client";

import type { FC } from "react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useDeleteDepartment, useDepartment } from "@/hooks/useDepartments";
import { ApiError } from "@/services/api";

type DepartmentDeleteModalProps = {
  departmentId: string | null;
  fallbackName?: string;
  onClose: () => void;
};

const DepartmentDeleteModal: FC<DepartmentDeleteModalProps> = ({
  departmentId,
  fallbackName,
  onClose,
}) => {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const open = Boolean(departmentId);
  const detail = useDepartment(departmentId ?? "", { enabled: open });
  const name = detail.data?.name ?? fallbackName ?? "this department";

  const close = () => {
    setDeleteError(null);
    onClose();
  };

  const remove = useDeleteDepartment(departmentId ?? "", {
    onError: (error) => {
      const message =
        error instanceof ApiError && error.code === "DEPARTMENT_IN_USE"
          ? "This department cannot be deleted because employees are assigned to it."
          : "Department could not be deleted. Try again.";

      setDeleteError(message);
    },
    onSuccess: () => {
      close();
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
      description="Departments can only be deleted when no employees are assigned to them."
      footer={
        <>
          <Button disabled={remove.isPending} onClick={close} variant="outline">
            Cancel
          </Button>
          <Button loading={remove.isPending} onClick={confirm}>
            Delete department
          </Button>
        </>
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !remove.isPending) close();
      }}
      open={open}
      title={`Delete ${name}?`}
    >
      {deleteError && (
        <Alert icon={<AlertCircle className="size-4" />} title="Delete failed" variant="danger">
          {deleteError}
        </Alert>
      )}
    </Modal>
  );
};

export default DepartmentDeleteModal;
