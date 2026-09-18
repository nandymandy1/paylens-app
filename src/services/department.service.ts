import api from "@/services/api";
import type { BaseResponseWithData } from "@/types/api-response.types";
import type { DepartmentInput, DepartmentSummary } from "@/types/department.type";

export const departmentKeys = {
  list: (organizationId: string | undefined) => ["departments", organizationId, "list"] as const,
  detail: (organizationId: string | undefined, departmentId: string) =>
    ["departments", organizationId, "detail", departmentId] as const,
};

export const fetchDepartments = async (): Promise<DepartmentSummary[]> => {
  const { data } = await api.get<BaseResponseWithData<DepartmentSummary[]>>("/departments");

  return data.data;
};

export const fetchDepartment = async (departmentId: string): Promise<DepartmentSummary> => {
  const { data } = await api.get<BaseResponseWithData<DepartmentSummary>>(
    `/departments/${departmentId}`,
  );

  return data.data;
};

export const createDepartment = async (input: DepartmentInput): Promise<DepartmentSummary> => {
  const { data } = await api.post<BaseResponseWithData<DepartmentSummary>>("/departments", input);

  return data.data;
};

export const updateDepartment = async (
  departmentId: string,
  input: DepartmentInput,
): Promise<DepartmentSummary> => {
  const { data } = await api.patch<BaseResponseWithData<DepartmentSummary>>(
    `/departments/${departmentId}`,
    input,
  );

  return data.data;
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
  await api.delete(`/departments/${departmentId}`);
};
