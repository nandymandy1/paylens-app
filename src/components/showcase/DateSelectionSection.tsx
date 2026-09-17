"use client";

import { useState, type FC } from "react";
import DatePicker from "@/components/ui/DatePicker";
import DateRangePicker from "@/components/ui/DateRangePicker";
import Rate from "@/components/ui/Rate";
import type { ISODateRange, ISODateString } from "@/utils/date";
import ShowcaseSection from "./ShowcaseSection";

const DateSelectionSection: FC = () => {
  const [date, setDate] = useState<ISODateString | undefined>("2026-09-17");
  const [range, setRange] = useState<ISODateRange>({
    endDate: "2026-09-30",
    startDate: "2026-09-17",
  });
  const [rate, setRate] = useState(3);

  return (
    <ShowcaseSection
      description="Date-only values stay predictable through the shared Day.js utility, while accessible calendar and rating controls retain the same input scale and surface language."
      eyebrow="10 / Date and selection"
      id="date-selection"
      title="Choose with confidence"
    >
      <div className="grid gap-10">
        <div className="grid gap-4">
          <h3 className="text-lg font-medium">Date picker</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DatePicker label="Empty date" placeholder="Choose a date" />
            <DatePicker label="Selected date" onChange={setDate} value={date} />
            <DatePicker disabled label="Disabled date" value="2026-09-17" />
            <DatePicker
              error="Choose a valid review date."
              label="Date with error"
            />
            <DatePicker inputSize="sm" label="Small date" value="2026-09-17" />
            <DatePicker inputSize="lg" label="Large date" value="2026-09-17" />
            <DatePicker
              label="Restricted date"
              maxDate="2026-09-30"
              minDate="2026-09-01"
              placeholder="September 2026 only"
            />
          </div>
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-medium">Date range picker</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <DateRangePicker label="Empty range" />
            <DateRangePicker
              label="Selected range"
              onChange={setRange}
              value={range}
            />
            <DateRangePicker
              label="Partial range"
              value={{ startDate: "2026-09-17" }}
            />
            <DateRangePicker disabled label="Disabled range" value={range} />
            <DateRangePicker
              label="Restricted range"
              maxDate="2026-09-30"
              minDate="2026-09-01"
            />
          </div>
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-medium">Rate</h3>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
            <Rate
              aria-label="Interactive rating"
              onChange={setRate}
              value={rate}
            />
            <Rate aria-label="Small rating" size="sm" value={2} />
            <Rate aria-label="Large rating" size="lg" value={4} />
            <Rate aria-label="Disabled rating" disabled value={3} />
            <Rate aria-label="Read-only rating" readOnly value={4} />
            <p className="text-sm text-body">Selected rating: {rate} of 5</p>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
};

export default DateSelectionSection;
