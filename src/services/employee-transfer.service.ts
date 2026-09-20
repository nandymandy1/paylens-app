import api from "@/services/api";
import type { BaseResponseWithData } from "@/types/api-response.types";
import type {
  CreateImportResponse,
  EmployeeExportJob,
  EmployeeImportJob,
  EmployeeTransferFormat,
} from "@/types/employee-transfer.type";

export const transferKeys = {
  // Tenant-scoped export cache. Logout/org-switch clearing in useAuth
  // removes these roots so no Org A filenames leak into Org B.
  exports: (organizationId: string | undefined) => ["employee-exports", organizationId] as const,
  exportDetail: (organizationId: string | undefined, exportId: string) =>
    ["employee-exports", organizationId, exportId] as const,
  imports: (organizationId: string | undefined) => ["employee-imports", organizationId] as const,
  importDetail: (organizationId: string | undefined, importId: string) =>
    ["employee-imports", organizationId, importId] as const,
};

export const createExport = async (format: EmployeeTransferFormat): Promise<EmployeeExportJob> => {
  const { data } = await api.post<BaseResponseWithData<EmployeeExportJob>>("/employee-exports", {
    format,
  });

  return data.data;
};

export const fetchExports = async (): Promise<EmployeeExportJob[]> => {
  const { data } = await api.get<BaseResponseWithData<EmployeeExportJob[]>>("/employee-exports");

  return data.data;
};

export const fetchExport = async (exportId: string): Promise<EmployeeExportJob> => {
  const { data } = await api.get<BaseResponseWithData<EmployeeExportJob>>(
    `/employee-exports/${exportId}`,
  );

  return data.data;
};

export const pauseExport = async (exportId: string): Promise<EmployeeExportJob> => {
  const { data } = await api.post<BaseResponseWithData<EmployeeExportJob>>(
    `/employee-exports/${exportId}/pause`,
  );

  return data.data;
};

export const resumeExport = async (exportId: string): Promise<EmployeeExportJob> => {
  const { data } = await api.post<BaseResponseWithData<EmployeeExportJob>>(
    `/employee-exports/${exportId}/resume`,
  );

  return data.data;
};

export const cancelExport = async (exportId: string): Promise<EmployeeExportJob> => {
  const { data } = await api.post<BaseResponseWithData<EmployeeExportJob>>(
    `/employee-exports/${exportId}/cancel`,
  );

  return data.data;
};

export const fetchExportDownloadUrl = async (
  exportId: string,
): Promise<{ url: string; fileName: string; expiresAt: string }> => {
  const { data } = await api.get<
    BaseResponseWithData<{ url: string; fileName: string; expiresAt: string }>
  >(`/employee-exports/${exportId}/download`);

  return data.data;
};

export const createImport = async (input: {
  fileName: string;
  format: EmployeeTransferFormat;
  sizeBytes: number;
  contentType: string;
}): Promise<CreateImportResponse> => {
  const { data } = await api.post<BaseResponseWithData<CreateImportResponse>>(
    "/employee-imports",
    input,
  );

  return data.data;
};

/**
 * Direct browser-to-storage PUT against the signed URL (not application API).
 * Credentials are never sent: the signature alone authorizes the upload, and
 * sending cookies only complicates the bucket CORS negotiation.
 */
export const uploadFileToSignedUrl = async (
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> => {
  await api.put(uploadUrl, file, {
    headers: { "Content-Type": contentType },
    timeout: 120_000,
    withCredentials: false,
  });
};

export const completeImportUpload = async (importId: string): Promise<EmployeeImportJob> => {
  const { data } = await api.post<BaseResponseWithData<EmployeeImportJob>>(
    `/employee-imports/${importId}/upload-complete`,
  );

  return data.data;
};

export const fetchImports = async (): Promise<EmployeeImportJob[]> => {
  const { data } = await api.get<BaseResponseWithData<EmployeeImportJob[]>>("/employee-imports");

  return data.data;
};

export const fetchImport = async (importId: string): Promise<EmployeeImportJob> => {
  const { data } = await api.get<BaseResponseWithData<EmployeeImportJob>>(
    `/employee-imports/${importId}`,
  );

  return data.data;
};

export const confirmImport = async (
  importId: string,
  createMissingDepartments: boolean,
): Promise<EmployeeImportJob> => {
  const { data } = await api.post<BaseResponseWithData<EmployeeImportJob>>(
    `/employee-imports/${importId}/confirm`,
    { createMissingDepartments },
  );

  return data.data;
};

export const pauseImport = async (importId: string): Promise<EmployeeImportJob> => {
  const { data } = await api.post<BaseResponseWithData<EmployeeImportJob>>(
    `/employee-imports/${importId}/pause`,
  );

  return data.data;
};

export const resumeImport = async (importId: string): Promise<EmployeeImportJob> => {
  const { data } = await api.post<BaseResponseWithData<EmployeeImportJob>>(
    `/employee-imports/${importId}/resume`,
  );

  return data.data;
};

export const cancelImport = async (importId: string): Promise<EmployeeImportJob> => {
  const { data } = await api.post<BaseResponseWithData<EmployeeImportJob>>(
    `/employee-imports/${importId}/cancel`,
  );

  return data.data;
};

export const fetchImportReportUrl = async (
  importId: string,
  type: "validation" | "apply",
): Promise<{ url: string }> => {
  const { data } = await api.get<BaseResponseWithData<{ url: string }>>(
    `/employee-imports/${importId}/report`,
    { params: { type } },
  );

  return data.data;
};
