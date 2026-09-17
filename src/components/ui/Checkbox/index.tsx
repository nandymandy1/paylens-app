"use client";

import { useId, type ComponentPropsWithRef, type FC } from "react";
import cn from "@/utils/cn";
import FormField, { getDescribedBy } from "@/components/ui/FormField";

type CheckboxProps = Omit<ComponentPropsWithRef<"input">, "type"> & {
  error?: string;
  helpText?: string;
  indeterminate?: boolean;
  label: string;
};

const Checkbox: FC<CheckboxProps> = ({
  "aria-describedby": ariaDescribedBy,
  className,
  error,
  helpText,
  id: providedId,
  indeterminate = false,
  label,
  onChange,
  ref,
  required,
  ...props
}) => {
  const generatedId = useId();
  const id = providedId ?? `checkbox-${generatedId}`;
  const setIndeterminate = (element: HTMLInputElement | null) => {
    if (element) element.indeterminate = indeterminate;
    if (typeof ref === "function") ref(element);
    else if (ref) ref.current = element;
  };

  return (
    <FormField error={error} helpText={helpText} id={id} required={required}>
      <label
        className="flex cursor-pointer items-start gap-3 text-sm text-ink"
        htmlFor={id}
      >
        <input
          {...props}
          aria-describedby={getDescribedBy(
            ariaDescribedBy,
            error,
            helpText,
            id,
          )}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "mt-0.5 size-4 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60 disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          id={id}
          onChange={onChange}
          ref={setIndeterminate}
          required={required}
          type="checkbox"
        />
        <span>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-danger">
              *
            </span>
          )}
        </span>
      </label>
    </FormField>
  );
};

export default Checkbox;
