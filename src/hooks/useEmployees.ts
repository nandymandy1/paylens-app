import { useQuery } from "@tanstack/react-query";
import { useMe } from "@/hooks/useAuth";
import useAuthSessionStore from "@/stores/auth-session";
import {
  employeeKeys,
  fetchDepartments,
  fetchEmployee,
  fetchEmployees,
} from "@/services/employee.service";
import type { EmployeeListParams } from "@/types/employee.type";

type EmployeeQueryContext = Omit<EmployeeListParams, "cursor"> & {
  organizationId: string | undefined;
};

const employeeQueryContext = (
  organizationId: string | undefined,
  params: EmployeeListParams,
): EmployeeQueryContext => ({
  countryCode: params.countryCode,
  departmentId: params.departmentId,
  direction: params.direction,
  employmentType: params.employmentType,
  limit: params.limit,
  organizationId,
  search: params.search,
  sort: params.sort,
  status: params.status,
});

const contextFromKey = (queryKey: readonly unknown[]): EmployeeQueryContext | null => {
  const [scope, organizationId, kind, params] = queryKey;

  if (scope !== "employees" || kind !== "list" || typeof params !== "object" || !params) {
    return null;
  }

  return employeeQueryContext(
    typeof organizationId === "string" ? organizationId : undefined,
    params as EmployeeListParams,
  );
};

const sameQueryContext = (
  previousKey: readonly unknown[],
  current: EmployeeQueryContext,
): boolean => JSON.stringify(contextFromKey(previousKey)) === JSON.stringify(current);

export const useEmployees = (params: EmployeeListParams, options: { enabled?: boolean } = {}) => {
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;

  const queryKey = employeeKeys.list(organizationId, params);
  const context = employeeQueryContext(organizationId, params);

  return useQuery({
    queryKey,
    queryFn: () => fetchEmployees(params),
    enabled:
      (sessionStatus === "authenticated" || sessionStatus === "unknown") &&
      Boolean(organizationId) &&
      (options.enabled ?? true),
    // Preserve a previous page only while the tenant and every non-cursor
    // filter/sort value match. Placeholder data is never a tenant boundary.
    placeholderData: (previous, previousQuery) =>
      previousQuery && sameQueryContext(previousQuery.queryKey, context) ? previous : undefined,
  });
};

export const useEmployee = (employeeId: string) => {
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;

  return useQuery({
    queryKey: employeeKeys.detail(organizationId, employeeId),
    queryFn: () => fetchEmployee(employeeId),
    enabled:
      (sessionStatus === "authenticated" || sessionStatus === "unknown") &&
      Boolean(organizationId && employeeId),
  });
};

export const useDepartments = (options: { enabled?: boolean } = {}) => {
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;

  return useQuery({
    queryKey: employeeKeys.departments(organizationId),
    queryFn: fetchDepartments,
    enabled:
      (sessionStatus === "authenticated" || sessionStatus === "unknown") &&
      Boolean(organizationId) &&
      (options.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
};
