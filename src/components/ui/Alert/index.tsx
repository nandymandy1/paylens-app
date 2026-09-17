import type { FC, PropsWithChildren, ReactNode } from "react";
import cn from "@/utils/cn";

type AlertVariant =
  "info" | "success" | "danger" | "neutral" | "dark" | "primary";

type AlertProps = PropsWithChildren<{
  className?: string;
  icon?: ReactNode;
  title?: string;
  variant?: AlertVariant;
}>;

const variantClasses: Record<AlertVariant, string> = {
  info: "border-info/35 bg-info-soft text-info",
  success: "border-success/35 bg-success-soft text-success",
  danger: "border-danger/35 bg-danger-soft text-danger",
  neutral: "border-hairline bg-surface-subtle text-ink",
  dark: "border-surface-dark-soft bg-canvas-dark text-on-dark",
  primary: "border-primary bg-primary text-on-primary",
};

const Alert: FC<AlertProps> = ({
  children,
  className,
  icon,
  title,
  variant = "neutral",
}) => {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-sm border p-4 text-sm leading-5",
        variantClasses[variant],
        className,
      )}
      role={variant === "danger" ? "alert" : "status"}
    >
      {icon && (
        <span aria-hidden="true" className="mt-0.5 shrink-0">
          {icon}
        </span>
      )}
      <div>
        <p className="font-mono text-[11px] font-medium tracking-[0.05em] uppercase">
          {title ?? variant}
        </p>
        <div className="mt-1 opacity-85">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
