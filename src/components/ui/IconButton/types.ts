import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { ButtonSize, ButtonVariant } from "@/components/ui/Button/types";

export type IconButtonShape = "square" | "circle";

export type IconButtonProps = Omit<ComponentPropsWithoutRef<"button">, "children"> & {
  "aria-label": string;
  icon: ReactNode;
  loading?: boolean;
  shape?: IconButtonShape;
  size?: ButtonSize;
  variant?: ButtonVariant;
};
