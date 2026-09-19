import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import useAuthSessionStore from "@/stores/auth-session";
import {
  createDepartment,
  deleteDepartment,
  departmentKeys,
  fetchDepartment,
  fetchDepartments,
  updateDepartment,
} from "@/services/department.service";
import { employeeKeys } from "@/services/employee.service";
import type { DepartmentInput, DepartmentSummary } from "@/types/department.type";

export const useDepartmentList = (options: { enabled?: boolean } = {}) => {
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;

  return useQuery({
    queryKey: departmentKeys.list(organizationId),
    queryFn: fetchDepartments,
    enabled:
      (sessionStatus === "authenticated" || sessionStatus === "unknown") &&
      Boolean(organizationId) &&
      (options.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDepartment = (departmentId: string, options: { enabled?: boolean } = {}) => {
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;

  return useQuery({
    queryKey: departmentKeys.detail(organizationId, departmentId),
    queryFn: () => fetchDepartment(departmentId),
    enabled:
      (sessionStatus === "authenticated" || sessionStatus === "unknown") &&
      Boolean(organizationId && departmentId) &&
      (options.enabled ?? true),
  });
};

type MutationCallbacks<TData> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
};

const departmentErrorMessage = (error: Error, fallback: string): string => {
  if (error instanceof ApiError) {
    if (error.code === "DEPARTMENT_CODE_ALREADY_EXISTS") {
      return "A department with this code already exists.";
    }

    if (error.code === "DEPARTMENT_IN_USE") {
      return "This department cannot be deleted because employees are assigned to it.";
    }

    if (error.code === "INSUFFICIENT_PERMISSION" || error.code === "MEMBERSHIP_REQUIRED") {
      return "Your role cannot manage departments.";
    }

    if (error.code === "DEPARTMENT_NOT_FOUND") {
      return "This department is unavailable in your active organization.";
    }
  }

  return fallback;
};

/** Authoritative invalidation: create responses carry server IDs, so never fake-insert rows. */
export const useCreateDepartment = (callbacks: MutationCallbacks<DepartmentSummary> = {}) => {
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;

  return useMutation({
    mutationFn: (input: DepartmentInput) => createDepartment(input),
    onMutate: () => {
      toast.loading("Creating department...", { id: "department-create" });
    },
    onError: (error) => {
      const message = departmentErrorMessage(error, "Could not create department.");

      toast.error("Could not create department.", {
        id: "department-create",
        description: message,
      });
      callbacks.onError?.(error);
    },
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: departmentKeys.list(organizationId) });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.departments(organizationId) });
      toast.success("Department created successfully.", { id: "department-create" });
      callbacks.onSuccess?.(created);
    },
  });
};

export const useUpdateDepartment = (
  departmentId: string,
  callbacks: MutationCallbacks<DepartmentSummary> = {},
) => {
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;
  const listKey = departmentKeys.list(organizationId);
  const detailKey = departmentKeys.detail(organizationId, departmentId);

  return useMutation({
    mutationFn: (input: DepartmentInput) => updateDepartment(departmentId, input),
    onMutate: async (input) => {
      toast.loading("Updating department...", { id: `department-update-${departmentId}` });
      await queryClient.cancelQueries({ queryKey: listKey });
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousList = queryClient.getQueryData<DepartmentSummary[]>(listKey);
      const previousDetail = queryClient.getQueryData<DepartmentSummary>(detailKey);

      queryClient.setQueryData<DepartmentSummary[] | undefined>(listKey, (current) =>
        current?.map((item) => (item.id === departmentId ? { ...item, ...input } : item)),
      );
      queryClient.setQueryData<DepartmentSummary | undefined>(detailKey, (current) =>
        current ? { ...current, ...input } : current,
      );

      return { previousList, previousDetail };
    },
    onError: (error, _input, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKey, context.previousList);
      }

      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }

      const message = departmentErrorMessage(error, "Could not update department.");

      toast.error("Could not update department.", {
        id: `department-update-${departmentId}`,
        description: message,
      });
      callbacks.onError?.(error);
    },
    onSuccess: async (updated, input) => {
      queryClient.setQueryData(detailKey, updated);
      queryClient.setQueryData<DepartmentSummary[] | undefined>(listKey, (current) =>
        current?.map((item) => (item.id === departmentId ? updated : item)),
      );
      await queryClient.invalidateQueries({ queryKey: listKey });
      await queryClient.invalidateQueries({ queryKey: detailKey });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.departments(organizationId) });

      // Department names render inside the employee directory: refresh them.
      if (input.name) {
        await queryClient.invalidateQueries({ queryKey: ["employees", organizationId, "list"] });
      }

      toast.success("Department updated successfully.", {
        id: `department-update-${departmentId}`,
      });
      callbacks.onSuccess?.(updated);
    },
  });
};

export const useDeleteDepartment = (
  departmentId: string,
  callbacks: MutationCallbacks<void> = {},
) => {
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;
  const listKey = departmentKeys.list(organizationId);
  const detailKey = departmentKeys.detail(organizationId, departmentId);

  return useMutation({
    mutationFn: () => deleteDepartment(departmentId),
    onMutate: async () => {
      toast.loading("Deleting department...", { id: `department-delete-${departmentId}` });
      await queryClient.cancelQueries({ queryKey: listKey });

      const previousList = queryClient.getQueryData<DepartmentSummary[]>(listKey);
      const previousDetail = queryClient.getQueryData<DepartmentSummary>(detailKey);

      queryClient.setQueryData<DepartmentSummary[] | undefined>(listKey, (current) =>
        current?.filter((item) => item.id !== departmentId),
      );
      queryClient.removeQueries({ queryKey: detailKey });

      return { previousList, previousDetail };
    },
    onError: (error, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(listKey, context.previousList);
      }

      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }

      const message = departmentErrorMessage(error, "Department could not be deleted.");

      toast.error("Department could not be deleted.", {
        id: `department-delete-${departmentId}`,
        description: message,
      });
      callbacks.onError?.(error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listKey });
      queryClient.removeQueries({ queryKey: detailKey });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.departments(organizationId) });
      toast.success("Department deleted successfully.", {
        id: `department-delete-${departmentId}`,
      });
      callbacks.onSuccess?.();
    },
  });
};
