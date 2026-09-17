import type { FC } from "react";
import { LoaderCircle } from "lucide-react";
import cn from "@/utils/cn";
import {
  BUTTON_BASE,
  BUTTON_VARIANT_CLASSES,
} from "@/components/ui/Button/constants";
import { ICON_BUTTON_SIZE_CLASSES } from "./constants";
import type { IconButtonProps } from "./types";

const IconButton: FC<IconButtonProps> = ({
  className,
  disabled,
  icon,
  loading = false,
  shape = "square",
  size = "md",
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
        "shrink-0 p-0",
        BUTTON_VARIANT_CLASSES[variant],
        ICON_BUTTON_SIZE_CLASSES[size],
        shape === "circle" ? "rounded-full" : "rounded-sm",
        className,
      )}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        icon
      )}
    </button>
  );
};

export default IconButton;
