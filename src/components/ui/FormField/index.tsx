import type { FC, PropsWithChildren } from "react";
import cn from "@/utils/cn";

export type FormFieldProps = PropsWithChildren<{
  className?: string;
  error?: string;
  helpText?: string;
  id: string;
  label?: string;
  required?: boolean;
}>;

const FormField: FC<FormFieldProps> = ({
  children,
  className,
  error,
  helpText,
  id,
  label,
  required = false,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-ink" htmlFor={id}>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-danger">
              *
            </span>
          )}
          {required && <span className="sr-only"> required</span>}
        </label>
      )}
      {children}
      {helpText && (
        <p className="text-sm text-body" id={`${id}-help`}>
          {helpText}
        </p>
      )}
      {error && (
        <p className="text-sm text-danger" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export const getDescribedBy = (
  describedBy: string | undefined,
  error: string | undefined,
  helpText: string | undefined,
  id: string,
) =>
  [describedBy, helpText && `${id}-help`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ") || undefined;

export default FormField;
