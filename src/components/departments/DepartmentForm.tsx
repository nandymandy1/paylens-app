"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FC } from "react";
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
  defaultValues?: DepartmentInput;
  onSubmit: (input: DepartmentInput) => void;
};

const DepartmentForm: FC<DepartmentFormProps> = ({
  defaultValues,
  isPending,
  serverError,
  submitLabel,
  onSubmit,
}) => {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: defaultValues ?? { code: "", name: "" },
  });

  return (
    <form className="grid gap-4" noValidate onSubmit={handleSubmit(onSubmit)}>
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
      <div>
        <Button loading={isPending} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default DepartmentForm;
