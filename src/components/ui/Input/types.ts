import type { ComponentPropsWithRef, ReactNode } from "react";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<ComponentPropsWithRef<"input">, "size"> & {
  error?: string;
  helpText?: string;
  inputSize?: InputSize;
  label?: string;
  prefixIcon?: ReactNode;
  suffixAction?: ReactNode;
  suffixIcon?: ReactNode;
};
