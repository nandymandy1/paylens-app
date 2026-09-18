import { useQuery } from "@tanstack/react-query";
import { useMe } from "@/hooks/useAuth";
import useAuthSessionStore from "@/stores/auth-session";
import { departmentKeys, fetchDepartment, fetchDepartments } from "@/services/department.service";

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
