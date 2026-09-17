"use client";

import { useId, useState, type FC, type ReactNode } from "react";
import cn from "@/utils/cn";

export type SegmentOption = {
  disabled?: boolean;
  label: ReactNode;
  prefixIcon?: ReactNode;
  value: string;
};

type SegmentProps = {
  "aria-label": string;
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SegmentOption[];
  value?: string;
};

const Segment: FC<SegmentProps> = ({
  "aria-label": ariaLabel,
  className,
  defaultValue,
  onValueChange,
  options,
  value,
}) => {
  const generatedName = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const selectedValue = value ?? uncontrolledValue;

  return (
    <div
      aria-label={ariaLabel}
      className={cn("inline-flex gap-1 rounded-sm bg-surface-subtle p-1", className)}
      role="radiogroup"
    >
      {options.map((option) => {
        const checked = option.value === selectedValue;

        return (
          <label
            className={cn(
              "inline-flex min-h-8 cursor-pointer items-center justify-center gap-2 rounded-sm px-3 text-xs font-medium text-body transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus/60",
              checked && "bg-primary text-on-primary shadow-soft",
              option.disabled && "cursor-not-allowed opacity-45",
            )}
            key={option.value}
          >
            <input
              checked={checked}
              className="sr-only"
              disabled={option.disabled}
              name={generatedName}
              onChange={() => {
                if (value === undefined) setUncontrolledValue(option.value);
                onValueChange?.(option.value);
              }}
              type="radio"
              value={option.value}
            />
            {option.prefixIcon}
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};

export default Segment;
