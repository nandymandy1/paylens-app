import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import {
  changeCompensation,
  compensationKeys,
  fetchCompensationHistory,
  fetchCurrentCompensation,
} from "@/services/compensation.service";
import type { ChangeCompensationRequest } from "@/types/compensation.type";

export const useCurrentCompensation = (employeeId: string, enabled = true) => {
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;

  return useQuery({
    queryKey: compensationKeys.current(organizationId, employeeId),
    queryFn: () => fetchCurrentCompensation(employeeId),
    enabled: Boolean(organizationId && employeeId && enabled),
  });
};

export const useCompensationHistory = (employeeId: string, enabled = true) => {
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;

  return useInfiniteQuery({
    queryKey: compensationKeys.history(organizationId, employeeId),
    queryFn: ({ pageParam }) => fetchCompensationHistory(employeeId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.pageInfo.nextCursor ?? undefined,
    enabled: Boolean(organizationId && employeeId && enabled),
  });
};

export const useChangeCompensation = (employeeId: string, onSuccess?: () => void) => {
  const client = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;

  return useMutation({
    mutationFn: ({
      input,
      idempotencyKey,
    }: {
      input: ChangeCompensationRequest;
      idempotencyKey: string;
    }) => changeCompensation(employeeId, input, idempotencyKey),
    onSuccess: async (current) => {
      client.setQueryData(compensationKeys.current(organizationId, employeeId), current);
      await client.invalidateQueries({
        queryKey: ["compensation", organizationId, "history", employeeId],
      });
      toast.success(
        current.version === 1
          ? "Compensation set successfully."
          : "Compensation updated successfully.",
        { id: `compensation-${employeeId}` },
      );
      onSuccess?.();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "COMPENSATION_VERSION_CONFLICT") return;
      toast.error("Could not update compensation.", { id: `compensation-${employeeId}` });
    },
  });
};
