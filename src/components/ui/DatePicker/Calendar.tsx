"use client";

import type { FC } from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";

const Calendar: FC<DayPickerProps> = (props) => (
  <DayPicker
    {...props}
    classNames={{
      button_next:
        "flex size-8 items-center justify-center rounded-sm text-body hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
      button_previous:
        "flex size-8 items-center justify-center rounded-sm text-body hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
      caption_label: "text-sm font-medium text-ink",
      day: "p-0 text-center",
      day_button:
        "flex size-9 items-center justify-center rounded-sm text-sm text-ink hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-35",
      disabled: "text-body opacity-35",
      month: "space-y-3",
      month_caption: "flex h-8 items-center justify-center",
      month_grid: "w-full border-collapse",
      months: "flex",
      nav: "absolute inset-x-0 top-0 flex items-center justify-between",
      outside: "text-body opacity-35",
      range_end: "bg-primary text-on-primary",
      range_middle: "bg-accent-mint",
      range_start: "bg-primary text-on-primary",
      root: "relative w-full",
      selected: "bg-primary text-on-primary",
      today: "font-medium underline decoration-accent-periwinkle underline-offset-4",
      weekday: "w-9 pb-2 text-center text-[11px] font-medium tracking-[0.05em] text-body uppercase",
      weekdays: "border-b border-hairline",
      week: "mt-1",
      weeks: "pt-2",
      ...props.classNames,
    }}
    fixedWeeks
    showOutsideDays
  />
);

export default Calendar;
