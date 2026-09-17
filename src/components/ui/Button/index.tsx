import type { FC } from "react";
import { LoaderCircle } from "lucide-react";
import cn from "@/utils/cn";
import { BUTTON_BASE, BUTTON_SIZE_CLASSES, BUTTON_VARIANT_CLASSES } from "./constants";
import type { ButtonProps } from "./types";

const Button: FC<ButtonProps> = ({
  block = false,
  children,
  className,
  disabled,
  loading = false,
  prefixIcon,
  size = "md",
  suffixIcon,
  type = "button",
  variant = "primary",
  ...props
}) => {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={cn(
        BUTTON_BASE,
        BUTTON_SIZE_CLASSES[size],
        BUTTON_VARIANT_CLASSES[variant],
        block && "w-full",
        className,
      )}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : prefixIcon}
      <span>{children}</span>
      {!loading && suffixIcon}
    </button>
  );
};

export default Button;
