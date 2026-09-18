export const EMPLOYEE_SORTS = ["lastName", "hireDate", "employeeNumber"] as const;

export type EmployeeSort = (typeof EMPLOYEE_SORTS)[number];

export const EMPLOYEE_DIRECTIONS = ["asc", "desc"] as const;

export type EmployeeDirection = (typeof EMPLOYEE_DIRECTIONS)[number];

export const EMPLOYEE_STATUSES = ["ACTIVE", "ON_LEAVE", "TERMINATED"] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

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
