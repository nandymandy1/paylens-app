import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import useAuthSessionStore from "@/stores/auth-session";
import {
  createEmployee,
  deleteEmployee,
  employeeKeys,
  fetchDepartments,
  fetchEmployee,
  fetchEmployees,
  updateEmployee,
} from "@/services/employee.service";
import type {
  EmployeeCreateRequest,
  EmployeeDetail,
  EmployeeListPage,
  EmployeeListParams,
  EmployeeUpdateRequest,
} from "@/types/employee.type";

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

type MutationCallbacks<TData> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
};

const employeeErrorMessage = (error: Error, fallback: string): string => {
  if (error instanceof ApiError) {
    if (error.code === "EMPLOYEE_NUMBER_ALREADY_EXISTS") {
      return "An employee with this employee number already exists.";
    }

    if (error.code === "EMPLOYEE_EMAIL_ALREADY_EXISTS") {
      return "An employee with this work email already exists.";
    }

    if (error.code === "DEPARTMENT_NOT_FOUND") {
      return "The selected department is unavailable in your active organization.";
    }

    if (error.code === "EMPLOYEE_NOT_FOUND") {
      return "This employee is unavailable in your active organization.";
    }

    if (error.code === "EMPLOYEE_HAS_COMPENSATION_HISTORY") {
      return "This employee cannot be deleted because compensation history exists.";
    }

    if (error.code === "INSUFFICIENT_PERMISSION" || error.code === "MEMBERSHIP_REQUIRED") {
      return "Your role cannot manage the workforce.";
    }
  }

  return fallback;
};

/** Authoritative invalidation: server IDs/pagination make fake list inserts unsafe. */
export const useCreateEmployee = (callbacks: MutationCallbacks<EmployeeDetail> = {}) => {
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;

  return useMutation({
    mutationFn: (input: EmployeeCreateRequest) => createEmployee(input),
    onMutate: () => {
      toast.loading("Creating employee...", { id: "employee-create" });
    },
    onError: (error) => {
      const message = employeeErrorMessage(error, "Could not create employee.");

      toast.error("Could not create employee.", { id: "employee-create", description: message });
      callbacks.onError?.(error);
    },
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["employees", organizationId, "list"] });
      toast.success("Employee created successfully.", { id: "employee-create" });
      callbacks.onSuccess?.(created);
    },
  });
};

export const useUpdateEmployee = (
  employeeId: string,
  callbacks: MutationCallbacks<EmployeeDetail> = {},
) => {
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;
  const detailKey = employeeKeys.detail(organizationId, employeeId);
  const listRoot: readonly unknown[] = ["employees", organizationId, "list"];

  return useMutation({
    mutationFn: (input: EmployeeUpdateRequest) => updateEmployee(employeeId, input),
    onMutate: async (input) => {
      toast.loading("Updating employee...", { id: `employee-update-${employeeId}` });
      await queryClient.cancelQueries({ queryKey: listRoot });
      await queryClient.cancelQueries({ queryKey: detailKey });

      // departmentId has no displayable name until the server responds:
      // authoritative invalidation reconciles it after success.
      const visiblePatch = { ...input };

      delete visiblePatch.departmentId;
      const previousLists = queryClient.getQueriesData<EmployeeListPage>({ queryKey: listRoot });
      const previousDetail = queryClient.getQueryData<EmployeeDetail>(detailKey);

      for (const [key, page] of previousLists) {
        if (!page) {
          continue;
        }

        queryClient.setQueryData<EmployeeListPage>(key, {
          ...page,
          items: page.items.map((item) =>
            item.id === employeeId ? { ...item, ...visiblePatch } : item,
          ),
        });
      }

      queryClient.setQueryData<EmployeeDetail | undefined>(detailKey, (current) =>
        current ? { ...current, ...visiblePatch } : current,
      );

      return { previousLists, previousDetail };
    },
    onError: (error, _input, context) => {
      for (const [key, page] of context?.previousLists ?? []) {
        queryClient.setQueryData(key, page);
      }

      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }

      const message = employeeErrorMessage(error, "Could not update employee.");

      toast.error("Could not update employee.", {
        id: `employee-update-${employeeId}`,
        description: message,
      });
      callbacks.onError?.(error);
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(detailKey, updated);
      await queryClient.invalidateQueries({ queryKey: listRoot });
      await queryClient.invalidateQueries({ queryKey: detailKey });
      toast.success("Employee updated successfully.", { id: `employee-update-${employeeId}` });
      callbacks.onSuccess?.(updated);
    },
  });
};

export const useDeleteEmployee = (employeeId: string, callbacks: MutationCallbacks<void> = {}) => {
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;
  const detailKey = employeeKeys.detail(organizationId, employeeId);
  const listRoot: readonly unknown[] = ["employees", organizationId, "list"];

  return useMutation({
    mutationFn: () => deleteEmployee(employeeId),
    onMutate: async () => {
      toast.loading("Deleting employee...", { id: `employee-delete-${employeeId}` });
      await queryClient.cancelQueries({ queryKey: listRoot });
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousLists = queryClient.getQueriesData<EmployeeListPage>({ queryKey: listRoot });
      const previousDetail = queryClient.getQueryData<EmployeeDetail>(detailKey);

      for (const [key, page] of previousLists) {
        if (!page) {
          continue;
        }

        queryClient.setQueryData<EmployeeListPage>(key, {
          ...page,
          items: page.items.filter((item) => item.id !== employeeId),
        });
      }

      queryClient.removeQueries({ queryKey: detailKey });

      return { previousLists, previousDetail };
    },
    onError: (error, _variables, context) => {
      for (const [key, page] of context?.previousLists ?? []) {
        queryClient.setQueryData(key, page);
      }

      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }

      const message = employeeErrorMessage(error, "Employee could not be deleted.");

      toast.error("Employee could not be deleted.", {
        id: `employee-delete-${employeeId}`,
        description: message,
      });
      callbacks.onError?.(error);
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: detailKey });
      await queryClient.invalidateQueries({ queryKey: listRoot });
      toast.success("Employee deleted successfully.", { id: `employee-delete-${employeeId}` });
      callbacks.onSuccess?.();
    },
  });
};
