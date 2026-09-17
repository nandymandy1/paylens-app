"use client";

import { useId, useRef, useState, type FC } from "react";
import cn from "@/utils/cn";
import FormField, { getDescribedBy } from "@/components/ui/FormField";
import { INPUT_BASE } from "@/components/ui/Input/constants";

type InputOTPProps = {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  inputMode?: "numeric" | "text";
  label?: string;
  length?: number;
  name?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  value?: string;
};

const InputOTP: FC<InputOTPProps> = ({
  className,
  defaultValue = "",
  disabled = false,
  error,
  helpText,
  inputMode = "numeric",
  label = "One-time code",
  length = 6,
  name,
  onChange,
  required = false,
  value,
}) => {
  const generatedId = useId();
  const id = `otp-${generatedId}`;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const currentValue = (value ?? uncontrolledValue).slice(0, length);
  const slots = Array.from({ length }, (_, index) => currentValue[index] ?? "");
  const invalid = Boolean(error);
  const updateValue = (nextValue: string) => {
    const sanitized =
      inputMode === "numeric" ? nextValue.replace(/\D/g, "") : nextValue;
    const next = sanitized.slice(0, length);
    if (value === undefined) setUncontrolledValue(next);
    onChange?.(next);
  };
  const focus = (index: number) => inputs.current[index]?.focus();

  return (
    <FormField
      error={error}
      helpText={helpText}
      id={id}
      label={label}
      required={required}
    >
      <div
        aria-describedby={getDescribedBy(undefined, error, helpText, id)}
        className={cn("flex gap-2", className)}
        role="group"
      >
        {slots.map((slot, index) => (
          <input
            aria-label={`${label} digit ${index + 1} of ${length}`}
            aria-invalid={invalid || undefined}
            className={cn(
              INPUT_BASE,
              "size-10 p-0 text-center text-base",
              invalid ? "border-danger" : "border-hairline",
            )}
            disabled={disabled}
            inputMode={inputMode}
            key={index}
            maxLength={1}
            name={name ? `${name}-${index}` : undefined}
            onChange={(event) => {
              const character = event.target.value.slice(-1);
              const next = `${currentValue.slice(0, index)}${character}${currentValue.slice(index + 1)}`;
              updateValue(next);
              if (character && index < length - 1) focus(index + 1);
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !slot && index > 0)
                focus(index - 1);
              if (event.key === "ArrowLeft" && index > 0) {
                event.preventDefault();
                focus(index - 1);
              }
              if (event.key === "ArrowRight" && index < length - 1) {
                event.preventDefault();
                focus(index + 1);
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              updateValue(event.clipboardData.getData("text"));
              focus(
                Math.min(
                  event.clipboardData.getData("text").length,
                  length - 1,
                ),
              );
            }}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            required={required && index === 0}
            type="text"
            value={slot}
          />
        ))}
      </div>
    </FormField>
  );
};

export default InputOTP;
