"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import InputEmail from "@/components/ui/InputEmail";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import {
  useCreateEmployee,
  useDepartments,
  useEmployee,
  useUpdateEmployee,
} from "@/hooks/useEmployees";
import { ApiError } from "@/services/api";
import {
  EMPLOYEE_COUNTRY_OPTIONS,
  EMPLOYMENT_TYPES,
  EMPLOYEE_STATUSES,
  employeeCreateSchema,
  employeeUpdateSchema,
  type EmployeeCreateFormValues,
  type EmployeeCreateRequest,
  type EmployeeDetail,
  type EmployeeUpdateFormValues,
  type EmployeeUpdateRequest,
} from "@/types/employee.type";
import { formatEnumLabel } from "@/utils/string";

type EmployeeFormModalProps = {
  mode: "create" | "edit" | null;
  employeeId: string | null;
  onClose: () => void;
};

type FieldErrors = Partial<
  Record<"employeeNumber" | "workEmail" | "departmentId" | "hireDate" | "terminationDate", string>
>;

const toCreateRequest = (values: EmployeeCreateFormValues): EmployeeCreateRequest => ({
  employeeNumber: values.employeeNumber.trim(),
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  ...(values.workEmail?.trim() ? { workEmail: values.workEmail.trim().toLowerCase() } : {}),
  departmentId: values.departmentId,
  jobTitle: values.jobTitle.trim(),
  ...(values.level?.trim() ? { level: values.level.trim() } : {}),
  countryCode: values.countryCode.trim().toUpperCase(),
  employmentType: values.employmentType,
  hireDate: values.hireDate,
});

const toUpdateRequest = (values: EmployeeUpdateFormValues): EmployeeUpdateRequest => {
  const request: EmployeeUpdateRequest = {};

  if (values.employeeNumber !== undefined) {
    request.employeeNumber = values.employeeNumber.trim();
  }

  if (values.firstName !== undefined) {
    request.firstName = values.firstName.trim();
  }

  if (values.lastName !== undefined) {
    request.lastName = values.lastName.trim();
  }

  if (values.workEmail !== undefined) {
    request.workEmail =
      values.workEmail === null || values.workEmail.trim() === ""
        ? null
        : values.workEmail.trim().toLowerCase();
  }

  if (values.departmentId !== undefined) {
    request.departmentId = values.departmentId;
  }

  if (values.jobTitle !== undefined) {
    request.jobTitle = values.jobTitle.trim();
  }

  if (values.level !== undefined) {
    request.level =
      values.level === null || values.level.trim() === "" ? null : values.level.trim();
  }

  if (values.countryCode !== undefined) {
    request.countryCode = values.countryCode.trim().toUpperCase();
  }

  if (values.employmentType !== undefined) {
    request.employmentType = values.employmentType;
  }

  if (values.status !== undefined) {
    request.status = values.status;
  }

  if (values.hireDate !== undefined) {
    request.hireDate = values.hireDate;
  }

  if (values.terminationDate !== undefined) {
    request.terminationDate =
      values.terminationDate === null || values.terminationDate === ""
        ? null
        : values.terminationDate;
  }

  return request;
};

/** Split a backend failure into a global message plus owning-field errors. */
const splitError = (error: Error, isEdit: boolean): { message: string; fields: FieldErrors } => {
  if (error instanceof ApiError) {
    if (error.code === "EMPLOYEE_NUMBER_ALREADY_EXISTS") {
      const message = "An employee with this employee number already exists.";

      return { message, fields: { employeeNumber: message } };
    }

    if (error.code === "EMPLOYEE_EMAIL_ALREADY_EXISTS") {
      const message = "An employee with this work email already exists.";

      return { message, fields: { workEmail: message } };
    }

    if (error.code === "DEPARTMENT_NOT_FOUND") {
      const message = "The selected department is unavailable in your active organization.";

      return { message, fields: { departmentId: "The selected department is unavailable." } };
    }

    if (error.code === "INVALID_TERMINATION_DATE") {
      return { message: error.message, fields: { terminationDate: error.message } };
    }

    if (error.code === "INSUFFICIENT_PERMISSION" || error.code === "MEMBERSHIP_REQUIRED") {
      return { message: "Your role cannot manage the workforce.", fields: {} };
    }

    if (error.code === "EMPLOYEE_NOT_FOUND") {
      return { message: "This employee is unavailable in your active organization.", fields: {} };
    }
  }

  return {
    message: isEdit
      ? "Could not update employee. Try again."
      : "Could not create employee. Try again.",
    fields: {},
  };
};

const departmentOptions = (departments: { id: string; code: string; name: string }[] | undefined) =>
  (departments ?? []).map((department) => ({
    title: `${department.name} (${department.code})`,
    value: department.id,
  }));

type EmployeeFormFieldsProps = {
  isEdit: boolean;
  isPending: boolean;
  serverError: string | null;
  fieldErrors: FieldErrors;
  submitLabel: string;
  formId?: string;
  hideSubmit?: boolean;
  defaultValues?: Partial<EmployeeCreateFormValues & EmployeeUpdateFormValues>;
  onSubmit: (values: EmployeeCreateFormValues & EmployeeUpdateFormValues) => void;
};

const EmployeeFormFields: FC<EmployeeFormFieldsProps> = ({
  isEdit,
  isPending,
  serverError,
  fieldErrors,
  submitLabel,
  formId,
  hideSubmit = false,
  defaultValues,
  onSubmit,
}) => {
  const schema = isEdit ? employeeUpdateSchema : employeeCreateSchema;
  // One shared field layout serves both schemas; the resolver is cast to the
  // combined form type because the create/update value shapes differ only in
  // optionality (runtime validation still uses the correct schema).
  const formResolver = zodResolver(schema) as unknown as Resolver<
    EmployeeCreateFormValues & EmployeeUpdateFormValues
  >;
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<EmployeeCreateFormValues & EmployeeUpdateFormValues>({
    resolver: formResolver,
    defaultValues: {
      countryCode: "",
      departmentId: "",
      employeeNumber: "",
      employmentType: undefined,
      firstName: "",
      hireDate: "",
      jobTitle: "",
      lastName: "",
      level: "",
      status: undefined,
      terminationDate: "",
      workEmail: "",
      ...defaultValues,
    },
  });
  const departments = useDepartments();
  const hasNoDepartments = !departments.isPending && (departments.data ?? []).length === 0;

  // Backend conflicts land on their owning field; the global alert stays.
  useEffect(() => {
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (message) {
        setError(field as keyof FieldErrors, { message });
      }
    }
  }, [fieldErrors, setError]);

  return (
    <form
      className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 px-1"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      id={formId}
    >
      <FormField
        error={errors.employeeNumber?.message}
        id="employee-number"
        label="Employee number"
        required
      >
        <Input id="employee-number" placeholder="EMP-1024" {...register("employeeNumber")} />
      </FormField>
      <FormField
        error={errors.departmentId?.message}
        id="employee-department"
        label="Department"
        required
      >
        <Controller
          control={control}
          name="departmentId"
          render={({ field }) => (
            <Select
              aria-label="Department"
              disabled={departments.isPending}
              id="employee-department"
              invalid={Boolean(errors.departmentId)}
              onChange={field.onChange}
              options={departmentOptions(departments.data)}
              placeholder={departments.isPending ? "Loading departments..." : "Select department"}
              value={field.value}
            />
          )}
        />
      </FormField>
      {hasNoDepartments && (
        <Alert className="sm:col-span-2" title="No departments" variant="neutral">
          No departments available. Create a department first.
        </Alert>
      )}
      <FormField
        error={errors.firstName?.message}
        id="employee-first-name"
        label="First name"
        required
      >
        <Input id="employee-first-name" placeholder="Asha" {...register("firstName")} />
      </FormField>
      <FormField
        error={errors.lastName?.message}
        id="employee-last-name"
        label="Last name"
        required
      >
        <Input id="employee-last-name" placeholder="Sharma" {...register("lastName")} />
      </FormField>
      <FormField error={errors.workEmail?.message} id="employee-work-email" label="Work email">
        <InputEmail
          id="employee-work-email"
          placeholder="asha@example.com"
          {...register("workEmail")}
        />
      </FormField>
      <FormField
        error={errors.jobTitle?.message}
        id="employee-job-title"
        label="Job title"
        required
      >
        <Input id="employee-job-title" placeholder="Senior Engineer" {...register("jobTitle")} />
      </FormField>
      <FormField error={errors.level?.message} id="employee-level" label="Level">
        <Input id="employee-level" placeholder="L4" {...register("level")} />
      </FormField>
      <FormField error={errors.countryCode?.message} id="employee-country" label="Country" required>
        <Controller
          control={control}
          name="countryCode"
          render={({ field }) => (
            <Select
              aria-label="Country"
              id="employee-country"
              invalid={Boolean(errors.countryCode)}
              onChange={field.onChange}
              options={EMPLOYEE_COUNTRY_OPTIONS.map((country) => ({
                title: country.label,
                value: country.code,
              }))}
              placeholder="Select country"
              value={field.value}
            />
          )}
        />
      </FormField>
      <FormField
        error={errors.employmentType?.message}
        id="employee-employment-type"
        label="Employment type"
        required
      >
        <Controller
          control={control}
          name="employmentType"
          render={({ field }) => (
            <Select
              aria-label="Employment type"
              id="employee-employment-type"
              invalid={Boolean(errors.employmentType)}
              onChange={field.onChange}
              options={EMPLOYMENT_TYPES.map((type) => ({
                title: formatEnumLabel(type),
                value: type,
              }))}
              placeholder="Select type"
              value={field.value}
            />
          )}
        />
      </FormField>
      <FormField
        error={errors.hireDate?.message}
        id="employee-hire-date"
        label="Hire date"
        required
      >
        <Input id="employee-hire-date" type="date" {...register("hireDate")} />
      </FormField>
      {isEdit && (
        <>
          <FormField error={errors.status?.message} id="employee-status" label="Status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  aria-label="Status"
                  id="employee-status"
                  invalid={Boolean(errors.status)}
                  onChange={field.onChange}
                  options={EMPLOYEE_STATUSES.map((status) => ({
                    title: formatEnumLabel(status),
                    value: status,
                  }))}
                  placeholder="Select status"
                  value={field.value}
                />
              )}
            />
          </FormField>
          <FormField
            error={errors.terminationDate?.message}
            helpText="Empty clears the termination date."
            id="employee-termination-date"
            label="Termination date"
          >
            <Input id="employee-termination-date" type="date" {...register("terminationDate")} />
          </FormField>
        </>
      )}
      {serverError && (
        <Alert
          className="sm:col-span-2"
          icon={<AlertCircle className="size-4" />}
          title="Save failed"
          variant="danger"
        >
          {serverError}
        </Alert>
      )}
      {!hideSubmit && (
        <div className="sm:col-span-2">
          <Button loading={isPending} type="submit">
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
};

const toEditDefaults = (
  employee: EmployeeDetail,
): Partial<EmployeeCreateFormValues & EmployeeUpdateFormValues> => ({
  countryCode: employee.countryCode,
  departmentId: employee.department.id,
  employeeNumber: employee.employeeNumber,
  employmentType: employee.employmentType as EmployeeUpdateFormValues["employmentType"],
  firstName: employee.firstName,
  hireDate: employee.hireDate,
  jobTitle: employee.jobTitle,
  lastName: employee.lastName,
  level: employee.level ?? "",
  status: employee.status as EmployeeUpdateFormValues["status"],
  terminationDate: employee.terminationDate ?? "",
  workEmail: employee.workEmail ?? "",
});

const EmployeeFormModal: FC<EmployeeFormModalProps> = ({ mode, employeeId, onClose }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formKey, setFormKey] = useState(0);
  const [createIdempotencyKey, setCreateIdempotencyKey] = useState<string | null>(null);
  const isEdit = mode === "edit" && Boolean(employeeId);
  const open = mode === "create" || isEdit;

  const detail = useEmployee(employeeId ?? "");

  const close = () => {
    setServerError(null);
    setFieldErrors({});
    setCreateIdempotencyKey(null);
    setFormKey((key) => key + 1);
    onClose();
  };

  const create = useCreateEmployee({
    onError: (error) => {
      const split = splitError(error, false);

      setServerError(split.message);
      setFieldErrors(split.fields);
    },
    onSuccess: () => {
      close();
    },
  });

  const update = useUpdateEmployee(employeeId ?? "", {
    onError: (error) => {
      const split = splitError(error, true);

      setServerError(split.message);
      setFieldErrors(split.fields);
    },
    onSuccess: () => {
      close();
    },
  });

  const submitLabel = isEdit ? "Save changes" : "Create employee";
  const submitPending = isEdit ? update.isPending : create.isPending;
  const formReady = !isEdit || Boolean(detail.data);

  const submitCreate = (values: EmployeeCreateFormValues & EmployeeUpdateFormValues) => {
    if (create.isPending) {
      return;
    }

    setServerError(null);
    setFieldErrors({});
    const idempotencyKey = createIdempotencyKey ?? crypto.randomUUID();

    if (!createIdempotencyKey) setCreateIdempotencyKey(idempotencyKey);
    create.mutate({ ...toCreateRequest(values as EmployeeCreateFormValues), idempotencyKey });
  };

  const submitUpdate = (values: EmployeeCreateFormValues & EmployeeUpdateFormValues) => {
    if (update.isPending) {
      return;
    }

    setServerError(null);
    setFieldErrors({});
    update.mutate(toUpdateRequest(values as EmployeeUpdateFormValues));
  };

  return (
    <Modal
      description={
        isEdit
          ? "Update workforce information without leaving the directory."
          : "Onboard an employee into your organization."
      }
      footer={
        <>
          <Button disabled={submitPending} onClick={close} variant="outline">
            Cancel
          </Button>
          {formReady && (
            <Button form="employee-form" loading={submitPending} type="submit">
              {submitLabel}
            </Button>
          )}
        </>
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !submitPending) close();
      }}
      open={open}
      size="lg"
      title={isEdit ? "Edit employee" : "Add employee"}
    >
      {isEdit && detail.isPending && (
        <div aria-label="Loading employee" className="grid gap-4">
          <div className="h-10 animate-pulse rounded-sm bg-surface-subtle" />
          <div className="h-10 animate-pulse rounded-sm bg-surface-subtle" />
        </div>
      )}

      {isEdit && detail.isError && (
        <Alert icon={<AlertCircle className="size-4" />} title="Load failed" variant="danger">
          This employee is unavailable in your active organization.
        </Alert>
      )}
      {isEdit && detail.data && (
        <EmployeeFormFields
          isEdit
          hideSubmit
          formId="employee-form"
          onSubmit={submitUpdate}
          serverError={serverError}
          fieldErrors={fieldErrors}
          submitLabel="Save changes"
          isPending={update.isPending}
          defaultValues={toEditDefaults(detail.data)}
          key={`${detail.data.id}-${detail.data.updatedAt}-${formKey}`}
        />
      )}
      {!isEdit && (
        <EmployeeFormFields
          hideSubmit
          isEdit={false}
          formId="employee-form"
          onSubmit={submitCreate}
          serverError={serverError}
          fieldErrors={fieldErrors}
          isPending={create.isPending}
          submitLabel="Create employee"
          key={`employee-create-${formKey}`}
        />
      )}
    </Modal>
  );
};

export default EmployeeFormModal;
