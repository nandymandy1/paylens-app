import { z } from "zod";

export const EMPLOYEE_SORTS = ["lastName", "hireDate", "employeeNumber"] as const;

export type EmployeeSort = (typeof EMPLOYEE_SORTS)[number];

export const EMPLOYEE_DIRECTIONS = ["asc", "desc"] as const;

export type EmployeeDirection = (typeof EMPLOYEE_DIRECTIONS)[number];

export const EMPLOYEE_STATUSES = ["ACTIVE", "ON_LEAVE", "TERMINATED"] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

/** Roles allowed to manage the workforce (backend authoritative). */
export const EMPLOYEE_WRITE_ROLES = ["TENANT_OWNER", "HR_ADMIN", "HR_MANAGER"] as const;

/** Roles allowed to view the workforce directory (backend authoritative). */
export const EMPLOYEE_DIRECTORY_ROLES = [
  "TENANT_OWNER",
  "HR_ADMIN",
  "HR_MANAGER",
  "MANAGER",
  "VIEWER_AUDITOR",
] as const;

export const EMPLOYEE_COUNTRY_OPTIONS = [
  { code: "IN", label: "India (IN)" },
  { code: "US", label: "United States (US)" },
  { code: "GB", label: "United Kingdom (GB)" },
  { code: "DE", label: "Germany (DE)" },
  { code: "FR", label: "France (FR)" },
  { code: "SG", label: "Singapore (SG)" },
  { code: "CA", label: "Canada (CA)" },
  { code: "AU", label: "Australia (AU)" },
  { code: "PL", label: "Poland (PL)" },
  { code: "NL", label: "Netherlands (NL)" },
] as const;

export type EmployeeDepartment = {
  id: string;
  code: string;
  name: string;
};

export type EmployeeListItem = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail: string | null;
  department: EmployeeDepartment;
  jobTitle: string;
  level: string | null;
  countryCode: string;
  employmentType: string;
  status: string;
  hireDate: string;
};

export type EmployeeDetail = EmployeeListItem & {
  terminationDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeListPage = {
  items: EmployeeListItem[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
};

export type EmployeeListParams = {
  search?: string;
  departmentId?: string;
  countryCode?: string;
  status?: string;
  employmentType?: string;
  sort: EmployeeSort;
  direction: EmployeeDirection;
  cursor?: string;
  limit: number;
};

export type DepartmentOption = {
  id: string;
  code: string;
  name: string;
};

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a calendar date (YYYY-MM-DD)");

const optionalWorkEmail = z
  .union([z.literal(""), z.string().trim().toLowerCase().pipe(z.email("Enter a valid work email"))])
  .optional();

/** Create-employee modal form values (empty strings mean "not provided"). */
export const employeeCreateSchema = z.object({
  employeeNumber: z.string().trim().min(1, "Employee number is required").max(64),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  workEmail: optionalWorkEmail,
  departmentId: z.string().min(1, "Department is required").max(64),
  jobTitle: z.string().trim().min(1, "Job title is required").max(120),
  level: z.string().trim().max(32).optional(),
  countryCode: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code")
    .regex(/^[A-Za-z]{2}$/, "Use a 2-letter country code"),
  employmentType: z.enum(EMPLOYMENT_TYPES, "Employment type is required"),
  hireDate: dateOnly,
});

export type EmployeeCreateFormValues = z.infer<typeof employeeCreateSchema>;

/** Edit-employee modal form values: every field optional (partial update). */
export const employeeUpdateSchema = z.object({
  employeeNumber: z.string().trim().min(1, "Employee number is required").max(64).optional(),
  firstName: z.string().trim().min(1, "First name is required").max(100).optional(),
  lastName: z.string().trim().min(1, "Last name is required").max(100).optional(),
  workEmail: z
    .union([
      z.literal(""),
      z.null(),
      z.string().trim().toLowerCase().pipe(z.email("Enter a valid work email")),
    ])
    .optional(),
  departmentId: z.string().min(1, "Department is required").max(64).optional(),
  jobTitle: z.string().trim().min(1, "Job title is required").max(120).optional(),
  level: z.union([z.literal(""), z.null(), z.string().trim().max(32)]).optional(),
  countryCode: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code")
    .regex(/^[A-Za-z]{2}$/, "Use a 2-letter country code")
    .optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  status: z.enum(EMPLOYEE_STATUSES).optional(),
  hireDate: dateOnly.optional(),
  terminationDate: z.union([z.literal(""), z.null(), dateOnly]).optional(),
});

export type EmployeeUpdateFormValues = z.infer<typeof employeeUpdateSchema>;

/** API request shapes (backend is the tenant boundary; never send organizationId). */
export type EmployeeCreateRequest = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail?: string;
  departmentId: string;
  jobTitle: string;
  level?: string;
  countryCode: string;
  employmentType: string;
  hireDate: string;
  /** Transport-only retry key; never serialized into the request body. */
  idempotencyKey?: string;
};

export type EmployeeUpdateRequest = {
  employeeNumber?: string;
  firstName?: string;
  lastName?: string;
  workEmail?: string | null;
  departmentId?: string;
  jobTitle?: string;
  level?: string | null;
  countryCode?: string;
  employmentType?: string;
  status?: string;
  hireDate?: string;
  terminationDate?: string | null;
};
