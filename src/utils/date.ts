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

export const toISODate = (value: Date): ISODateString =>
  dayjs(value).format(DATE_FORMAT);

export const formatDate = (value?: ISODateString) =>
  value ? dayjs(value, DATE_FORMAT, true).format("DD MMM YYYY") : "";

export const compareDates = (left: ISODateString, right: ISODateString) =>
  dayjs(left, DATE_FORMAT, true).diff(dayjs(right, DATE_FORMAT, true), "day");

export const normalizeDateRange = (range: ISODateRange): ISODateRange => {
  if (
    range.startDate &&
    range.endDate &&
    compareDates(range.startDate, range.endDate) > 0
  ) {
    return { endDate: range.startDate, startDate: range.endDate };
  }

  return range;
};
