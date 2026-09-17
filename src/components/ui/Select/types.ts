import type { ReactNode } from "react";

export type SelectSize = "sm" | "md" | "lg";

export type SelectOption<TValue extends string = string> = {
  value: TValue;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  avatar?: {
    alt?: string;
    fallback: string;
    src?: string;
  };
  disabled?: boolean;
};

export type SelectProps<TValue extends string = string> = {
  id?: string;
  name?: string;
  options: readonly SelectOption<TValue>[];
  value?: TValue;
  defaultValue?: TValue;
  placeholder?: string;
  size?: SelectSize;
  disabled?: boolean;
  invalid?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  className?: string;
  contentClassName?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  onChange?: (value: TValue, option: SelectOption<TValue>) => void;
};
