import type { FC, PropsWithChildren } from "react";
import cn from "@/utils/cn";

type BadgeVariant = "success" | "danger" | "warning" | "info" | "primary";

type BadgeProps = PropsWithChildren<{
  className?: string;
  variant?: BadgeVariant;
}>;

const variantClasses: Record<BadgeVariant, string> = {
  success: "border-success/25 bg-success-soft text-success",
  danger: "border-danger/25 bg-danger-soft text-danger",
  warning: "border-warning/25 bg-warning-soft text-warning",
  info: "border-info/25 bg-info-soft text-info",
  primary: "border-primary bg-primary text-on-primary",
};

const Badge: FC<BadgeProps> = ({
  children,
  className,
  variant = "primary",
}) => {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] leading-none font-medium tracking-[0.05em] uppercase",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
