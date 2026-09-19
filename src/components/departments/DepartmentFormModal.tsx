"use client";

import type { FC } from "react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import DepartmentForm from "@/components/departments/DepartmentForm";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useCreateDepartment, useDepartment, useUpdateDepartment } from "@/hooks/useDepartments";
import { ApiError } from "@/services/api";
import type { DepartmentInput } from "@/types/department.type";

type DepartmentFormModalProps = {
  mode: "create" | "edit" | null;
  departmentId: string | null;
  onClose: () => void;
};

const toServerMessage = (error: Error): { code: string | null; message: string } => {
  if (error instanceof ApiError) {
    if (error.code === "DEPARTMENT_CODE_ALREADY_EXISTS") {
      return { code: error.code, message: "A department with this code already exists." };
    }

    if (error.code === "INSUFFICIENT_PERMISSION" || error.code === "MEMBERSHIP_REQUIRED") {
      return { code: error.code, message: "Your role cannot manage departments." };
    }

    if (error.code === "DEPARTMENT_NOT_FOUND") {
      return {
        code: error.code,
        message: "This department is unavailable in your active organization.",
      };
    }
  }

  return { code: null, message: "Could not save department. Try again." };
};

const DepartmentFormModal: FC<DepartmentFormModalProps> = ({ mode, departmentId, onClose }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const isEdit = mode === "edit" && Boolean(departmentId);

  const detail = useDepartment(departmentId ?? "", { enabled: isEdit });

  const close = () => {
    setServerError(null);
    setServerCode(null);
    onClose();
  };

  const create = useCreateDepartment({
    onError: (error) => {
      const mapped = toServerMessage(error);

      setServerCode(mapped.code);
      setServerError(mapped.message);
    },
    onSuccess: () => {
      close();
    },
  });

  const update = useUpdateDepartment(departmentId ?? "", {
    onError: (error) => {
      const mapped = toServerMessage(error);

      setServerCode(mapped.code);
      setServerError(mapped.message);
    },
    onSuccess: () => {
      close();
    },
  });

  const mutation = isEdit ? update : create;
  const open = mode === "create" || isEdit;
  const submitLabel = isEdit ? "Save changes" : "Create department";
  const formReady = !isEdit || Boolean(detail.data);

  const submit = (input: DepartmentInput) => {
    if (mutation.isPending) {
      return;
    }

    setServerError(null);
    setServerCode(null);
    mutation.mutate(input);
  };

  return (
    <Modal
      description={
        isEdit
          ? "Update this department without leaving the list."
          : "Add a team to your organization."
      }
      footer={
        <>
          <Button disabled={mutation.isPending} onClick={close} variant="outline">
            Cancel
          </Button>
          {formReady && (
            <Button form="department-form" loading={mutation.isPending} type="submit">
              {submitLabel}
            </Button>
          )}
        </>
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !mutation.isPending) close();
      }}
      open={open}
      title={isEdit ? "Edit department" : "Create department"}
    >
      {isEdit && detail.isPending && (
        <div aria-label="Loading department" className="grid gap-4">
          <div className="h-10 animate-pulse rounded-sm bg-surface-subtle" />
          <div className="h-10 animate-pulse rounded-sm bg-surface-subtle" />
        </div>
      )}

      {isEdit && detail.isError && (
        <Alert icon={<AlertCircle className="size-4" />} title="Load failed" variant="danger">
          This department is unavailable in your active organization.
        </Alert>
      )}

      {isEdit && detail.data && (
        <DepartmentForm
          key={detail.data.updatedAt}
          defaultValues={{ code: detail.data.code, name: detail.data.name }}
          isPending={update.isPending}
          serverCode={serverCode}
          serverError={serverError}
          submitLabel="Save changes"
          formId="department-form"
          hideSubmit
          onSubmit={submit}
        />
      )}

      {!isEdit && (
        <DepartmentForm
          key="department-create"
          isPending={create.isPending}
          serverCode={serverCode}
          serverError={serverError}
          submitLabel="Create department"
          formId="department-form"
          hideSubmit
          onSubmit={submit}
        />
      )}
    </Modal>
  );
};

export default DepartmentFormModal;
