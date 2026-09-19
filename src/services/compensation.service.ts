import api from "@/services/api";
import type { BaseResponseWithData } from "@/types/api-response.types";
import type {
  ChangeCompensationRequest,
  CompensationHistoryPage,
  CurrentCompensation,
} from "@/types/compensation.type";

export const compensationKeys = {
  current: (organizationId: string | undefined, employeeId: string) =>
    ["compensation", organizationId, "current", employeeId] as const,
  history: (organizationId: string | undefined, employeeId: string) =>
    ["compensation", organizationId, "history", employeeId] as const,
};

export const fetchCurrentCompensation = async (
  employeeId: string,
): Promise<CurrentCompensation | null> => {
  const { data } = await api.get<BaseResponseWithData<CurrentCompensation | null>>(
    `/employees/${employeeId}/compensation`,
  );

  return data.data;
};

export const fetchCompensationHistory = async (
  employeeId: string,
  cursor?: string,
): Promise<CompensationHistoryPage> => {
  const { data } = await api.get<BaseResponseWithData<CompensationHistoryPage>>(
    `/employees/${employeeId}/compensation/history`,
    { params: { limit: 20, ...(cursor ? { cursor } : {}) } },
  );

  return data.data;
};

export const changeCompensation = async (
  employeeId: string,
  input: ChangeCompensationRequest,
  idempotencyKey: string,
): Promise<CurrentCompensation> => {
  const { data } = await api.post<BaseResponseWithData<CurrentCompensation>>(
    `/employees/${employeeId}/compensation/changes`,
    input,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );

  return data.data;
};
