import type { SelectSize } from "./types";

export const SELECT_TRIGGER_SIZE_CLASSES: Record<SelectSize, string> = {
  sm: "min-h-9 px-2.5 text-sm",
  md: "min-h-10 px-3 text-sm",
  lg: "min-h-11 px-3.5 text-base",
};

export const SELECT_OPTION_SIZE_CLASSES: Record<SelectSize, string> = {
  sm: "px-2.5 py-2 text-sm",
  md: "px-3 py-2.5 text-sm",
  lg: "px-3.5 py-3 text-base",
};
