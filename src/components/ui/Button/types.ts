import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type ButtonVariant = "primary" | "mint" | "white" | "ghost" | "outline";

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  block?: boolean;
  loading?: boolean;
  prefixIcon?: ReactNode;
  size?: ButtonSize;
  suffixIcon?: ReactNode;
  variant?: ButtonVariant;
};
