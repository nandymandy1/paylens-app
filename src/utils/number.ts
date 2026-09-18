import BigNumber from "bignumber.js";

BigNumber.config({ DECIMAL_PLACES: 20 });

const groupInteger = (digits: string): string => {
  const sign = digits.startsWith("-") ? "-" : "";
  const body = sign ? digits.slice(1) : digits;
  const grouped = body.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${sign}${grouped}`;
};

/**
 * Format a decimal money string without ever converting it to a JS float.
 * The API always sends salaries as decimal strings (e.g. "1850000.00").
 */
export const formatMoneyString = (amount: string, currency: string): string => {
  const normalized = new BigNumber(amount).toFixed(2);
  const [integer, fraction] = normalized.split(".");

  return `${currency} ${groupInteger(integer ?? "0")}.${fraction ?? "00"}`;
};

export const formatCompensation = (
  compensation: { annualBaseSalary: string; currency: string } | null,
): string => {
  if (!compensation) {
    return "—";
  }

  return formatMoneyString(compensation.annualBaseSalary, compensation.currency);
};
