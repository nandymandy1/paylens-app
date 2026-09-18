"use client";

import { useId, useState, type FC } from "react";
import { CalendarRange, X } from "lucide-react";
import type { Matcher } from "react-day-picker";
import FormField, { getDescribedBy } from "@/components/ui/FormField";
import Popover from "@/components/ui/Popover";
import cn from "@/utils/cn";
import {
  formatDateRange,
  normalizeDateRange,
  parseDate,
  toISODate,
  type ISODateRange,
  type ISODateString,
} from "@/utils/date";
import { INPUT_BASE, INPUT_SIZE_CLASSES } from "@/components/ui/Input/constants";
import type { InputSize } from "@/components/ui/Input/types";
import Calendar from "@/components/ui/DatePicker/Calendar";

type DateRangePickerProps = {
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
  onChange?: (value: ISODateRange) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value?: ISODateRange;
};

const DateRangePicker: FC<DateRangePickerProps> = ({
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
  placeholder = "Select a date range",
  readOnly = false,
  required,
  value,
}) => {
  const generatedId = useId();
  const id = providedId ?? `date-range-picker-${generatedId}`;
  const [open, setOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState<ISODateRange>({});
  const selectedValue = value ?? uncontrolledValue;
  const invalid = Boolean(error);
  const displayValue = formatDateRange(selectedValue) || placeholder;
  const disabledDays: Matcher[] = [
    ...(minDate ? [{ before: parseDate(minDate)! }] : []),
    ...(maxDate ? [{ after: parseDate(maxDate)! }] : []),
    ...(isDateDisabled ? [(date: Date) => isDateDisabled(toISODate(date))] : []),
  ];
  const changeValue = (nextValue: ISODateRange) => {
    const normalizedValue = normalizeDateRange(nextValue);

    if (value === undefined) setUncontrolledValue(normalizedValue);
    onChange?.(normalizedValue);
  };

  return (
    <FormField error={error} helpText={helpText} id={id} label={label} required={required}>
      <div className="relative">
        <Popover
          content={
            <Calendar
              defaultMonth={parseDate(selectedValue.startDate) ?? parseDate(minDate)}
              disabled={disabledDays}
              excludeDisabled
              mode="range"
              onSelect={(range) => {
                const nextValue = {
                  endDate: range?.to ? toISODate(range.to) : undefined,
                  startDate: range?.from ? toISODate(range.from) : undefined,
                };

                changeValue(nextValue);
                if (nextValue.startDate && nextValue.endDate) setOpen(false);
              }}
              selected={{
                from: parseDate(selectedValue.startDate),
                to: parseDate(selectedValue.endDate),
              }}
            />
          }
          onOpenChange={setOpen}
          open={open}
        >
          <button
            aria-describedby={getDescribedBy(ariaDescribedBy, error, helpText, id)}
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
            <span className={selectedValue.startDate ? "text-ink" : "text-body"}>
              {displayValue}
            </span>
            <CalendarRange aria-hidden="true" className="size-4 shrink-0 text-body" />
          </button>
        </Popover>
        {selectedValue.startDate && !disabled && !readOnly && (
          <button
            aria-label="Clear date range"
            className="absolute inset-y-0 right-8 flex items-center px-2 text-body hover:text-ink focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              changeValue({});
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

export default DateRangePicker;
