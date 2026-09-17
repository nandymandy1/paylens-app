"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentPropsWithRef,
  type FC,
  type PropsWithChildren,
} from "react";
import cn from "@/utils/cn";
import FormField, { getDescribedBy } from "@/components/ui/FormField";

type RadioGroupContextValue = {
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

const RadioGroupContext = createContext<RadioGroupContextValue>({});

type RadioProps = Omit<ComponentPropsWithRef<"input">, "type"> & {
  label: string;
};

export const Radio: FC<RadioProps> = ({
  className,
  disabled,
  id: providedId,
  label,
  name,
  onChange,
  value,
  ...props
}) => {
  const context = useContext(RadioGroupContext);
  const generatedId = useId();
  const id = providedId ?? `radio-${generatedId}`;
  const radioValue = String(value ?? "");
  const isChecked = context.value === radioValue;

  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-ink" htmlFor={id}>
      <input
        {...props}
        checked={context.value === undefined ? undefined : isChecked}
        className={cn(
          "size-4 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        disabled={disabled ?? context.disabled}
        id={id}
        name={name ?? context.name}
        onChange={(event) => {
          onChange?.(event);
          if (event.defaultPrevented) return;
          context.onValueChange?.(radioValue);
        }}
        type="radio"
        value={value}
      />
      <span>{label}</span>
    </label>
  );
};

type RadioGroupProps = PropsWithChildren<{
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  label?: string;
  name: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  value?: string;
}>;

export const RadioGroup: FC<RadioGroupProps> = ({
  children,
  className,
  defaultValue,
  disabled,
  error,
  helpText,
  label,
  name,
  onValueChange,
  required,
  value,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const generatedId = useId();
  const id = `radio-group-${generatedId}`;
  const selectedValue = value ?? uncontrolledValue;

  return (
    <FormField error={error} helpText={helpText} id={id} label={label} required={required}>
      <RadioGroupContext.Provider
        value={{
          disabled,
          name,
          onValueChange: (nextValue) => {
            if (value === undefined) setUncontrolledValue(nextValue);
            onValueChange?.(nextValue);
          },
          value: selectedValue,
        }}
      >
        <fieldset
          aria-describedby={getDescribedBy(undefined, error, helpText, id)}
          aria-invalid={Boolean(error) || undefined}
          className={cn("grid gap-3", className)}
          disabled={disabled}
        >
          <legend className="sr-only">{label ?? name}</legend>
          {children}
        </fieldset>
      </RadioGroupContext.Provider>
    </FormField>
  );
};
