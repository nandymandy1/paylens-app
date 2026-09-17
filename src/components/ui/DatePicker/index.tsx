"use client";

import { useId, useState, type FC } from "react";
import { CalendarDays, X } from "lucide-react";
import type { Matcher } from "react-day-picker";
import FormField, { getDescribedBy } from "@/components/ui/FormField";
import Popover from "@/components/ui/Popover";
import cn from "@/utils/cn";
import {
  formatDate,
  parseDate,
  toISODate,
  type ISODateString,
} from "@/utils/date";
import { INPUT_BASE, INPUT_SIZE_CLASSES } from "../Input/constants";
import type { InputSize } from "../Input/types";
import Calendar from "./Calendar";

type DatePickerProps = {
  "aria-describedby"?: string;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  id?: string;
  inputSize?: InputSize;
  isDateDisabled?: (date: ISODateString) => boolean;
  label?: string;
  maxDate?: ISODateString;
  minDate?: ISODateString;
  onChange?: (value?: ISODateString) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value?: ISODateString;
};

const DatePicker: FC<DatePickerProps> = ({
  "aria-describedby": ariaDescribedBy,
  disabled = false,
  error,
  helpText,
  id: providedId,
  inputSize = "md",
  isDateDisabled,
  label,
  maxDate,
  minDate,
  onChange,
  placeholder = "Select a date",
  readOnly = false,
  required,
  value,
}) => {
  const generatedId = useId();
  const id = providedId ?? `date-picker-${generatedId}`;
  const [open, setOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateString>();
  const selectedValue = value ?? uncontrolledValue;
  const invalid = Boolean(error);
  const displayValue = formatDate(selectedValue) || placeholder;
  const disabledDays: Matcher[] = [
    ...(minDate ? [{ before: parseDate(minDate)! }] : []),
    ...(maxDate ? [{ after: parseDate(maxDate)! }] : []),
    ...(isDateDisabled
      ? [(date: Date) => isDateDisabled(toISODate(date))]
      : []),
  ];

  const changeValue = (nextValue?: ISODateString) => {
    if (value === undefined) setUncontrolledValue(nextValue);
    onChange?.(nextValue);
  };

  return (
    <FormField
      error={error}
      helpText={helpText}
      id={id}
      label={label}
      required={required}
    >
      <div className="relative">
        <Popover
          content={
            <Calendar
              defaultMonth={parseDate(selectedValue) ?? parseDate(minDate)}
              disabled={disabledDays}
              mode="single"
              onSelect={(date) => {
                if (!date) return;
                changeValue(toISODate(date));
                setOpen(false);
              }}
              selected={parseDate(selectedValue)}
            />
          }
          onOpenChange={setOpen}
          open={open}
        >
          <button
            aria-describedby={getDescribedBy(
              ariaDescribedBy,
              error,
              helpText,
              id,
            )}
            aria-label={label ? `${label}: ${displayValue}` : displayValue}
            className={cn(
              INPUT_BASE,
              INPUT_SIZE_CLASSES[inputSize],
              "flex items-center justify-between gap-3 text-left",
              invalid ? "border-danger" : "border-hairline",
            )}
            disabled={disabled}
            data-invalid={invalid || undefined}
            data-readonly={readOnly || undefined}
            id={id}
            onClick={(event) => {
              if (readOnly) event.preventDefault();
            }}
            type="button"
          >
            <span className={selectedValue ? "text-ink" : "text-body"}>
              {displayValue}
            </span>
            <CalendarDays
              aria-hidden="true"
              className="size-4 shrink-0 text-body"
            />
          </button>
        </Popover>
        {selectedValue && !disabled && !readOnly && (
          <button
            aria-label="Clear date"
            className="absolute inset-y-0 right-8 flex items-center px-2 text-body hover:text-ink focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              changeValue(undefined);
            }}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </FormField>
  );
};

export default DatePicker;
