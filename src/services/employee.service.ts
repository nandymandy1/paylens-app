import api from "@/services/api";
import type { BaseResponseWithData } from "@/types/api-response.types";
import type {
  DepartmentOption,
  EmployeeCreateRequest,
  EmployeeDetail,
  EmployeeListPage,
  EmployeeListParams,
  EmployeeUpdateRequest,
} from "@/types/employee.type";

export const employeeKeys = {
  list: (organizationId: string | undefined, params: EmployeeListParams) =>
    ["employees", organizationId, "list", params] as const,
  detail: (organizationId: string | undefined, employeeId: string) =>
    ["employees", organizationId, "detail", employeeId] as const,
  departments: (organizationId: string | undefined) =>
    ["employees", organizationId, "departments"] as const,
};

const toQuery = (params: EmployeeListParams): Record<string, string> => {
  const query: Record<string, string> = {
    sort: params.sort,
    direction: params.direction,
    limit: String(params.limit),
  };

  if (params.search?.trim()) {
    query.search = params.search.trim();
  }

  if (params.departmentId) {
    query.departmentId = params.departmentId;
  }

  if (params.countryCode) {
    query.countryCode = params.countryCode;
  }

  if (params.status) {
    query.status = params.status;
  }

  if (params.employmentType) {
    query.employmentType = params.employmentType;
  }

  if (params.cursor) {
    query.cursor = params.cursor;
  }

  return query;
};

export const fetchEmployees = async (params: EmployeeListParams): Promise<EmployeeListPage> => {
  const { data } = await api.get<BaseResponseWithData<EmployeeListPage>>("/employees", {
    params: toQuery(params),
  });

  return data.data;
};

export const fetchEmployee = async (employeeId: string): Promise<EmployeeDetail> => {
  const { data } = await api.get<BaseResponseWithData<EmployeeDetail>>(`/employees/${employeeId}`);

  return data.data;
};

export const fetchDepartments = async (): Promise<DepartmentOption[]> => {
  const { data } = await api.get<BaseResponseWithData<DepartmentOption[]>>("/departments");

  return data.data;
};

export const createEmployee = async (input: EmployeeCreateRequest): Promise<EmployeeDetail> => {
  const { idempotencyKey, ...body } = input;
  const { data } = await api.post<BaseResponseWithData<EmployeeDetail>>("/employees", body, {
    headers: { "Idempotency-Key": idempotencyKey },
  });

  return data.data;
};

export const updateEmployee = async (
  employeeId: string,
  input: EmployeeUpdateRequest,
): Promise<EmployeeDetail> => {
  const { data } = await api.patch<BaseResponseWithData<EmployeeDetail>>(
    `/employees/${employeeId}`,
    input,
  );

  return data.data;
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  await api.delete(`/employees/${employeeId}`);
};
