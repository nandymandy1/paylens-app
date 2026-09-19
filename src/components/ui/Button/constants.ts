import type { ButtonSize, ButtonVariant } from "./types";

export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-mono font-medium uppercase tracking-[0.005em] transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-40";

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-8 px-3 text-[11px]",
  md: "min-h-10 px-4 text-[12px]",
  lg: "min-h-11 px-6 text-[12px]",
  xl: "min-h-12 px-7 text-sm",
};

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-canvas hover:-translate-y-px hover:shadow-elevated active:translate-y-0 active:scale-[0.995]",
  mint: "bg-accent-mint text-black hover:opacity-85",
  white: "border border-hairline bg-white text-black hover:opacity-85",
  ghost: "bg-surface-dark-soft text-on-dark hover:opacity-85 data-[theme=dark]:bg-surface-subtle",
  outline:
    "border border-hairline bg-surface text-ink hover:border-hairline-strong hover:bg-surface-hover",
};
