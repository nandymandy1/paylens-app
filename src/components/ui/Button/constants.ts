import type { ButtonSize, ButtonVariant } from "./types";

export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm font-mono font-medium uppercase tracking-[0.005em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60 disabled:pointer-events-none disabled:opacity-45";

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-6 text-sm",
  xl: "min-h-12 px-7 text-base",
};

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-80",
  mint: "bg-accent-mint text-black hover:opacity-80",
  white: "border border-hairline bg-white text-black hover:opacity-80",
  ghost:
    "bg-surface-dark-soft text-on-dark hover:opacity-80 data-[theme=dark]:bg-surface-subtle",
  outline: "border border-hairline bg-surface text-ink hover:bg-surface-subtle",
};
