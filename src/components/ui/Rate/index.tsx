"use client";

import { useId, useState, type FC } from "react";
import { Star } from "lucide-react";
import cn from "@/utils/cn";
import type { InputSize } from "../Input/types";

type RateProps = {
  "aria-label"?: string;
  defaultValue?: number;
  disabled?: boolean;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: InputSize;
  value?: number;
};

const STAR_SIZE_CLASSES: Record<InputSize, string> = {
  lg: "size-7",
  md: "size-5",
  sm: "size-4",
};

const Rate: FC<RateProps> = ({
  "aria-label": ariaLabel = "Rating",
  defaultValue = 0,
  disabled = false,
  max = 5,
  onChange,
  readOnly = false,
  size = "md",
  value,
}) => {
  const id = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [hoveredValue, setHoveredValue] = useState<number>();
  const selectedValue = value ?? uncontrolledValue;
  const displayedValue = hoveredValue ?? selectedValue;
  const values = Array.from(
    { length: Math.max(1, max) },
    (_, index) => index + 1,
  );

  if (readOnly) {
    return (
      <div
        aria-label={`${ariaLabel}: ${selectedValue} of ${max}`}
        className="flex gap-1"
        role="img"
      >
        {values.map((rating) => (
          <Star
            aria-hidden="true"
            className={cn(
              STAR_SIZE_CLASSES[size],
              rating <= selectedValue
                ? "fill-primary text-primary"
                : "text-hairline",
            )}
            key={rating}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-label={ariaLabel}
      className="flex gap-1"
      onMouseLeave={() => setHoveredValue(undefined)}
      role="radiogroup"
    >
      {values.map((rating) => (
        <label
          className={cn(
            "cursor-pointer rounded-sm text-hairline transition-colors peer-has-[:focus-visible]:ring-2 peer-has-[:focus-visible]:ring-focus/60",
            disabled && "cursor-not-allowed opacity-60",
            rating <= displayedValue && "text-primary",
          )}
          key={rating}
          onMouseEnter={() => !disabled && setHoveredValue(rating)}
        >
          <input
            aria-label={`${rating} of ${max} stars`}
            checked={selectedValue === rating}
            className="peer sr-only"
            disabled={disabled}
            name={`rate-${id}`}
            onChange={() => {
              if (value === undefined) setUncontrolledValue(rating);
              onChange?.(rating);
            }}
            type="radio"
            value={rating}
          />
          <Star
            aria-hidden="true"
            className={cn(
              STAR_SIZE_CLASSES[size],
              rating <= displayedValue && "fill-current",
            )}
          />
        </label>
      ))}
    </div>
  );
};

export default Rate;
