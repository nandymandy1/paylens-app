import type { InputSize } from "./types";

export const INPUT_BASE =
  "block w-full rounded-sm border bg-surface text-ink placeholder:text-body transition-[border-color,box-shadow,background-color] duration-150 ease-out hover:border-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60 disabled:cursor-not-allowed disabled:bg-canvas-soft disabled:opacity-60";

export const INPUT_SIZE_CLASSES: Record<InputSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-10 px-3 text-sm",
  lg: "min-h-12 px-4 text-base",
};

export const INPUT_ICON_INSET_CLASSES: Record<InputSize, string> = {
  sm: "inset-y-0 left-2.5 [&>svg]:size-3.5",
  md: "inset-y-0 left-3 [&>svg]:size-4",
  lg: "inset-y-0 left-4 [&>svg]:size-5",
};

export const INPUT_ICON_PADDING_CLASSES: Record<InputSize, string> = {
  sm: "pl-9",
  md: "pl-10",
  lg: "pl-12",
};

export const INPUT_SUFFIX_INSET_CLASSES: Record<InputSize, string> = {
  sm: "inset-y-0 right-2.5 [&>svg]:size-3.5",
  md: "inset-y-0 right-3 [&>svg]:size-4",
  lg: "inset-y-0 right-4 [&>svg]:size-5",
};

export const INPUT_SUFFIX_PADDING_CLASSES: Record<InputSize, string> = {
  sm: "pr-9",
  md: "pr-10",
  lg: "pr-12",
};

export const INPUT_SUFFIX_ACTION_PADDING_CLASSES: Record<InputSize, string> = {
  sm: "pr-12",
  md: "pr-14",
  lg: "pr-16",
};
