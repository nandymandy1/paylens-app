"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FC } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import { departmentSchema, type DepartmentInput } from "@/types/department.type";

type DepartmentFormProps = {
  isPending: boolean;
  submitLabel: string;
  serverError: string | null;
  serverCode?: string | null;
  defaultValues?: DepartmentInput;
  formId?: string;
  hideSubmit?: boolean;
  onSubmit: (input: DepartmentInput) => void;
};

const DepartmentForm: FC<DepartmentFormProps> = ({
  defaultValues,
  isPending,
  serverError,
  serverCode,
  submitLabel,
  formId,
  hideSubmit = false,
  onSubmit,
}) => {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: defaultValues ?? { code: "", name: "" },
  });

  // Map stable backend conflicts onto the owning field; the global alert stays.
  useEffect(() => {
    if (serverCode === "DEPARTMENT_CODE_ALREADY_EXISTS") {
      setError("code", { message: "A department with this code already exists." });
    }
  }, [serverCode, setError]);

  return (
    <form className="grid gap-4" noValidate onSubmit={handleSubmit(onSubmit)} id={formId}>
      <FormField error={errors.name?.message} id="department-name" label="Department name" required>
        <Input id="department-name" placeholder="Engineering" {...register("name")} />
      </FormField>
      <FormField
        error={errors.code?.message}
        helpText="Short tenant-unique code. Stored uppercase."
        id="department-code"
        label="Department code"
        required
      >
        <Input id="department-code" placeholder="ENG" {...register("code")} />
      </FormField>
      {serverError && (
        <Alert icon={<AlertCircle className="size-4" />} title="Save failed" variant="danger">
          {serverError}
        </Alert>
      )}
      {!hideSubmit && (
        <div>
          <Button loading={isPending} type="submit">
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
};

export default DepartmentForm;
