import { useId, type ComponentPropsWithRef, type FC } from "react";
import cn from "@/utils/cn";
import FormField, { getDescribedBy } from "@/components/ui/FormField";

type SwitchSize = "sm" | "md";

type SwitchProps = Omit<ComponentPropsWithRef<"input">, "size" | "type"> & {
  error?: string;
  helpText?: string;
  label: string;
  size?: SwitchSize;
};

const sizeClasses: Record<SwitchSize, string> = {
  sm: "h-5 w-9 before:size-3 before:translate-x-1 checked:before:translate-x-5",
  md: "h-6 w-11 before:size-4 before:translate-x-1 checked:before:translate-x-6",
};

const Switch: FC<SwitchProps> = ({
  "aria-describedby": ariaDescribedBy,
  className,
  error,
  helpText,
  id: providedId,
  label,
  required,
  size = "md",
  ...props
}) => {
  const generatedId = useId();
  const id = providedId ?? `switch-${generatedId}`;

  return (
    <FormField error={error} helpText={helpText} id={id} required={required}>
      <label
        className="flex cursor-pointer items-center gap-3 text-sm text-ink"
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
            "relative shrink-0 cursor-pointer appearance-none rounded-full bg-surface-subtle transition-colors before:absolute before:top-1/2 before:block before:-translate-y-1/2 before:rounded-full before:bg-surface before:transition-transform checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60 disabled:cursor-not-allowed disabled:opacity-60",
            sizeClasses[size],
            className,
          )}
          id={id}
          required={required}
          role="switch"
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

export default Switch;
