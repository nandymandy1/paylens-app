"use client";

import { ChevronDown, Check } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useState, type FC, type ReactNode } from "react";
import Avatar from "@/components/ui/Avatar";
import cn from "@/utils/cn";
import { SELECT_OPTION_SIZE_CLASSES, SELECT_TRIGGER_SIZE_CLASSES } from "./constants";
import type { SelectOption, SelectProps } from "./types";

const OptionVisual: FC<{ option: SelectOption; size?: "sm" | "md" }> = ({ option, size }) => {
  if (option.avatar) {
    return (
      <Avatar
        alt={option.avatar.alt ?? (typeof option.title === "string" ? option.title : "Option")}
        fallback={option.avatar.fallback}
        size={size ?? "sm"}
        src={option.avatar.src}
      />
    );
  }

  return option.icon ? (
    <span className="flex size-4 shrink-0 items-center justify-center">{option.icon}</span>
  ) : null;
};

const Select = <TValue extends string = string>({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  className,
  contentClassName,
  defaultValue,
  disabled = false,
  id,
  invalid = false,
  name,
  onChange,
  options,
  placeholder = "Select an option",
  prefixIcon,
  size = "md",
  suffixIcon,
  value,
}: SelectProps<TValue>) => {
  const [internalValue, setInternalValue] = useState<TValue | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const effectiveValue = isControlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === effectiveValue);
  const rootValueProps = isControlled ? { value } : { defaultValue };
  const renderTriggerValue = (option: SelectOption<TValue> | undefined): ReactNode => {
    if (!option) return <span className="text-body">{placeholder}</span>;

    return (
      <span className="flex min-w-0 items-center gap-2">
        <OptionVisual option={option} />
        <span className="truncate">{option.title}</span>
      </span>
    );
  };

  return (
    <SelectPrimitive.Root
      {...rootValueProps}
      disabled={disabled}
      name={name}
      onValueChange={(nextValue) => {
        const option = options.find((candidate) => candidate.value === nextValue);

        if (!option) {
          return;
        }

        if (!isControlled) setInternalValue(nextValue as TValue);
        onChange?.(nextValue as TValue, option);
      }}
    >
      <SelectPrimitive.Trigger
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        className={cn(
          "flex w-full items-center gap-2 rounded-sm border bg-surface text-left text-ink outline-none transition-colors",
          "border-hairline hover:border-body/50 focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30",
          "data-[state=open]:border-focus data-[state=open]:ring-2 data-[state=open]:ring-focus/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-danger focus-visible:border-danger focus-visible:ring-danger/30",
          SELECT_TRIGGER_SIZE_CLASSES[size],
          className,
        )}
        id={id}
      >
        {prefixIcon && (
          <span aria-hidden="true" className="flex shrink-0 text-body">
            {prefixIcon}
          </span>
        )}
        <span className="min-w-0 flex-1">{renderTriggerValue(selectedOption)}</span>
        <SelectPrimitive.Icon asChild>
          <span aria-hidden="true" className="flex shrink-0 text-body">
            {suffixIcon ?? <ChevronDown className="size-4" />}
          </span>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "z-[70] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-sm border border-hairline bg-surface text-ink shadow-soft",
            contentClassName,
          )}
          position="popper"
          sideOffset={6}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                className={cn(
                  "relative flex cursor-default select-none items-center gap-2 rounded-sm pr-8 outline-none",
                  "data-[highlighted]:bg-canvas-soft data-[state=checked]:bg-canvas-soft data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
                  SELECT_OPTION_SIZE_CLASSES[size],
                )}
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                <OptionVisual option={option} />
                <span className="min-w-0 flex-1">
                  <SelectPrimitive.ItemText>{option.title}</SelectPrimitive.ItemText>
                  {option.subtitle && (
                    <span className="mt-0.5 block text-xs text-body">{option.subtitle}</span>
                  )}
                </span>
                <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center text-primary">
                  <Check aria-hidden="true" className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

export default Select;

export type { SelectOption, SelectProps, SelectSize } from "./types";
