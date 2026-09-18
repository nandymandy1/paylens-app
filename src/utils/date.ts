import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/** A calendar date, kept date-only at the component and API boundary. */
export type ISODateString = string;

export type ISODateRange = {
  endDate?: ISODateString;
  startDate?: ISODateString;
};

const DATE_FORMAT = "YYYY-MM-DD";

export const parseDate = (value?: ISODateString) => {
  if (!value || !dayjs(value, DATE_FORMAT, true).isValid()) return undefined;

  return dayjs(`${value}T00:00:00`).toDate();
};

export const toISODate = (value: Date): ISODateString => dayjs(value).format(DATE_FORMAT);

export const formatDate = (value?: ISODateString) => {
  if (!value) {
    return "";
  }

  // Strict date-only first (canonical boundary), then generic ISO datetime
  // (API createdAt/expiresAt are full ISO timestamps).
  if (dayjs(value, DATE_FORMAT, true).isValid()) {
    return dayjs(value, DATE_FORMAT, true).format("DD MMM YYYY");
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format("DD MMM YYYY") : "";
};

export const compareDates = (left: ISODateString, right: ISODateString) =>
  dayjs(left, DATE_FORMAT, true).diff(dayjs(right, DATE_FORMAT, true), "day");

export const normalizeDateRange = (range: ISODateRange): ISODateRange => {
  if (range.startDate && range.endDate && compareDates(range.startDate, range.endDate) > 0) {
    return { endDate: range.startDate, startDate: range.endDate };
  }

  return range;
};

/** True when the given ISO date/datetime is strictly before now. */
export const isPastDate = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value, DATE_FORMAT, true).isValid()
    ? dayjs(value, DATE_FORMAT, true)
    : dayjs(value);

  return parsed.isValid() ? parsed.isBefore(dayjs()) : false;
};

/** Generic date-range display: "01 Jan 2026 — 05 Jan 2026" or start + placeholder. */
export const formatDateRange = (range: ISODateRange): string => {
  if (range.startDate && range.endDate) {
    return `${formatDate(range.startDate)} — ${formatDate(range.endDate)}`;
  }

  return range.startDate ? `${formatDate(range.startDate)} — Select end date` : "";
};
