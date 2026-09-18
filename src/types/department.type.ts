import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().trim().min(2, "Department name must be at least 2 characters").max(100),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Department code must be at least 2 characters")
    .max(20)
    .regex(/^[A-Z0-9][A-Z0-9-]{1,19}$/, "Use letters, digits, and hyphens only"),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

export type DepartmentSummary = {
  id: string;
  code: string;
  name: string;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
};
