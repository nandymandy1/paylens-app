"use client";

import { Search } from "lucide-react";
import type { FC } from "react";
import FilterToolbar from "@/components/ui/FilterToolbar";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { DepartmentOption, EmployeeDirection, EmployeeSort } from "@/types/employee.type";
import {
  EMPLOYEE_COUNTRY_OPTIONS,
  EMPLOYMENT_TYPES,
  EMPLOYEE_STATUSES,
} from "@/types/employee.type";
import { formatEnumLabel } from "@/utils/string";

type EmployeeFiltersProps = {
  search: string;
  status: string;
  sort: EmployeeSort;
  countryCode: string;
  departmentId: string;
  employmentType: string;
  hasActiveFilters: boolean;
  direction: EmployeeDirection;
  departments: DepartmentOption[] | undefined;
  onClearFilters: () => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onSortChange: (value: EmployeeSort) => void;
  onEmploymentTypeChange: (value: string) => void;
  onDirectionChange: (value: EmployeeDirection) => void;
};

const ALL = "ALL";

const EmployeeFilters: FC<EmployeeFiltersProps> = ({
  search,
  departmentId,
  countryCode,
  status,
  employmentType,
  sort,
  direction,
  departments,
  hasActiveFilters,
  onSearchChange,
  onDepartmentChange,
  onCountryChange,
  onStatusChange,
  onEmploymentTypeChange,
  onSortChange,
  onDirectionChange,
  onClearFilters,
}) => (
  <FilterToolbar
    ariaLabel="Employee filters"
    clearLabel="Clear filters"
    onClear={onClearFilters}
    showClear={hasActiveFilters}
    search={
      <Input
        aria-label="Search name, email or employee ID"
        inputSize="sm"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search name, email or employee ID"
        prefixIcon={<Search aria-hidden="true" className="size-4" />}
        value={search}
      />
    }
    controls={[
      <Select
        aria-label="Department filter"
        key="department"
        onChange={onDepartmentChange}
        options={[
          { title: "All departments", value: ALL },
          ...(departments ?? []).map((department) => ({
            title: department.name,
            value: department.id,
          })),
        ]}
        size="sm"
        value={departmentId}
      />,
      <Select
        aria-label="Country filter"
        key="country"
        onChange={onCountryChange}
        options={[
          { title: "All countries", value: ALL },
          ...EMPLOYEE_COUNTRY_OPTIONS.map((country) => ({
            title: country.label,
            value: country.code,
          })),
        ]}
        size="sm"
        value={countryCode}
      />,
      <Select
        aria-label="Status filter"
        key="status"
        onChange={onStatusChange}
        options={[
          { title: "All statuses", value: ALL },
          ...EMPLOYEE_STATUSES.map((item) => ({ title: formatEnumLabel(item), value: item })),
        ]}
        size="sm"
        value={status}
      />,
      <Select
        aria-label="Employment type filter"
        key="type"
        onChange={onEmploymentTypeChange}
        options={[
          { title: "All types", value: ALL },
          ...EMPLOYMENT_TYPES.map((item) => ({ title: formatEnumLabel(item), value: item })),
        ]}
        size="sm"
        value={employmentType}
      />,
      <Select<EmployeeSort>
        aria-label="Sort employees"
        key="sort"
        onChange={onSortChange}
        options={[
          { title: "Name", value: "lastName" },
          { title: "Hire date", value: "hireDate" },
          { title: "Employee ID", value: "employeeNumber" },
        ]}
        size="sm"
        value={sort}
      />,
      <Select<EmployeeDirection>
        aria-label="Sort direction"
        key="direction"
        onChange={onDirectionChange}
        options={[
          { title: "Ascending", value: "asc" },
          { title: "Descending", value: "desc" },
        ]}
        size="sm"
        value={direction}
      />,
    ]}
  />
);

export default EmployeeFilters;
