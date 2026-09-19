import { z } from "zod";
import BigNumber from "bignumber.js";

export const COMPENSATION_CURRENCIES = ["INR", "USD", "GBP", "EUR", "SGD"] as const;

export const COMPENSATION_REASONS = [
  "ANNUAL_REVIEW",
  "PROMOTION",
  "MARKET_ADJUSTMENT",
  "CORRECTION",
  "OTHER",
] as const;

export type CurrentCompensation = {
  employeeId: string;
  annualBaseSalary: string;
  currency: string;
  effectiveFrom: string;
  version: number;
};

export type CompensationHistoryItem = {
  id: string;
  version: number;
  previousAnnualBaseSalary: string | null;
  newAnnualBaseSalary: string;
  previousCurrency: string | null;
  newCurrency: string;
  previousEffectiveFrom: string | null;
  effectiveFrom: string;
  reason: string;
  note: string | null;
  changedBy: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
};

export type CompensationHistoryPage = {
  items: CompensationHistoryItem[];
  pageInfo: { nextCursor: string | null; hasNextPage: boolean };
};

export type ChangeCompensationRequest = {
  annualBaseSalary: string;
  currency: string;
  effectiveFrom: string;
  expectedVersion: number;
  reason?: string;
  note?: string;
};

export const compensationFormSchema = z.object({
  annualBaseSalary: z
    .string()
    .regex(
      /^(?:0|[1-9]\d{0,16})(?:\.\d{1,2})?$/,
      "Use a valid amount with no more than 2 decimal places",
    )
    .refine(
      (value) => new BigNumber(value).isFinite() && new BigNumber(value).isGreaterThan(0),
      "Enter a positive salary amount",
    ),
  currency: z.enum(COMPENSATION_CURRENCIES, "Select a currency"),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose an effective date"),
  reason: z.enum(COMPENSATION_REASONS).optional(),
  note: z.string().max(1000).optional(),
});

export type CompensationFormValues = z.infer<typeof compensationFormSchema>;
