"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type FC } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { useChangeCompensation } from "@/hooks/useCompensation";
import { ApiError } from "@/services/api";
import {
  COMPENSATION_CURRENCIES,
  COMPENSATION_REASONS,
  compensationFormSchema,
  type CompensationFormValues,
  type CurrentCompensation,
} from "@/types/compensation.type";

type CompensationModalProps = {
  mode: "set" | "change" | null;
  employeeId: string;
  current: CurrentCompensation | null | undefined;
  onClose: () => void;
  onVersionConflict: () => void;
};

const CompensationModal: FC<CompensationModalProps> = ({
  mode,
  employeeId,
  current,
  onClose,
  onVersionConflict,
}) => {
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const form = useForm<CompensationFormValues>({
    resolver: zodResolver(compensationFormSchema),
    defaultValues: {
      annualBaseSalary: current?.annualBaseSalary ?? "",
      currency: (current?.currency as CompensationFormValues["currency"]) ?? "INR",
      effectiveFrom: current?.effectiveFrom ?? "",
      reason: "ANNUAL_REVIEW",
      note: "",
    },
  });
  const mutation = useChangeCompensation(employeeId, () => {
    setIdempotencyKey(null);
    form.reset();
    onClose();
  });
  const draft = useWatch({ control: form.control });
  const close = () => {
    setIdempotencyKey(null);
    onClose();
  };

  useEffect(() => {
    if (mode) {
      form.reset({
        annualBaseSalary: current?.annualBaseSalary ?? "",
        currency: (current?.currency as CompensationFormValues["currency"]) ?? "INR",
        effectiveFrom: current?.effectiveFrom ?? "",
        reason: "ANNUAL_REVIEW",
        note: "",
      });
    }
    // Current refetches must not erase a draft after a version conflict.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, mode]);
  const submit = (values: CompensationFormValues) => {
    const key = idempotencyKey ?? crypto.randomUUID();

    if (!idempotencyKey) setIdempotencyKey(key);
    mutation.mutate(
      {
        input: {
          ...values,
          expectedVersion: current?.version ?? 0,
          ...(mode === "change" ? { reason: values.reason } : {}),
        },
        idempotencyKey: key,
      },
      {
        onError: (error) => {
          if (error instanceof ApiError && error.code === "COMPENSATION_VERSION_CONFLICT")
            onVersionConflict();
          if (error instanceof ApiError && error.code === "IDEMPOTENCY_KEY_CONFLICT") {
            setIdempotencyKey(null);
          }
        },
      },
    );
  };
  const isChange = mode === "change";

  return (
    <Modal
      open={Boolean(mode)}
      onOpenChange={(open) => !open && close()}
      title={isChange ? "Change compensation" : "Set compensation"}
      description={
        isChange
          ? "Submit an audited change to this employee’s current compensation."
          : "Initial compensation is recorded as an audited event."
      }
      footer={
        <>
          <Button variant="outline" type="button" onClick={close}>
            Cancel
          </Button>
          <Button form="compensation-form" type="submit" disabled={mutation.isPending}>
            {isChange ? "Change compensation" : "Set compensation"}
          </Button>
        </>
      }
    >
      {mutation.error instanceof ApiError &&
        mutation.error.code === "COMPENSATION_VERSION_CONFLICT" && (
          <Alert title="Compensation changed while you were editing." variant="info">
            Latest current compensation:{" "}
            {current ? `${current.currency} ${current.annualBaseSalary}` : "Unavailable"}. Your
            proposed compensation: {draft.currency} {draft.annualBaseSalary || "—"}. Review it
            before submitting again.
          </Alert>
        )}
      {mutation.error instanceof ApiError && mutation.error.code === "IDEMPOTENCY_KEY_CONFLICT" && (
        <Alert title="Submission token conflict" variant="info">
          This submission token was already used for a different compensation change. Review the
          form and submit again.
        </Alert>
      )}
      <form
        id="compensation-form"
        className="grid gap-4"
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <FormField
          id="compensation-salary"
          label="Annual base salary"
          required
          error={form.formState.errors.annualBaseSalary?.message}
        >
          <Input
            id="compensation-salary"
            inputMode="decimal"
            placeholder="1850000.00"
            {...form.register("annualBaseSalary")}
          />
        </FormField>
        <Controller
          control={form.control}
          name="currency"
          render={({ field, fieldState }) => (
            <FormField
              id="compensation-currency"
              label="Currency"
              required
              error={fieldState.error?.message}
            >
              <Select
                id="compensation-currency"
                value={field.value}
                onChange={field.onChange}
                options={COMPENSATION_CURRENCIES.map((value) => ({ value, title: value }))}
              />
            </FormField>
          )}
        />
        <FormField
          id="compensation-effective-from"
          label="Effective from"
          required
          error={form.formState.errors.effectiveFrom?.message}
        >
          <Input id="compensation-effective-from" type="date" {...form.register("effectiveFrom")} />
        </FormField>
        {isChange && (
          <Controller
            control={form.control}
            name="reason"
            render={({ field, fieldState }) => (
              <FormField
                id="compensation-reason"
                label="Reason"
                required
                error={fieldState.error?.message}
              >
                <Select
                  id="compensation-reason"
                  value={field.value}
                  onChange={field.onChange}
                  options={COMPENSATION_REASONS.map((value) => ({
                    value,
                    title: value.replaceAll("_", " "),
                  }))}
                />
              </FormField>
            )}
          />
        )}
        <FormField id="compensation-note" label="Note" error={form.formState.errors.note?.message}>
          <Input id="compensation-note" {...form.register("note")} />
        </FormField>
      </form>
    </Modal>
  );
};

export default CompensationModal;
