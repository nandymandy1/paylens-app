export type EmployeeTransferFormat = "CSV" | "XLSX";

export type EmployeeExportStatus =
  | "QUEUED"
  | "PROCESSING"
  | "PAUSING"
  | "PAUSED"
  | "CANCELLING"
  | "CANCELLED"
  | "FINALIZING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export type EmployeeExportJob = {
  id: string;
  format: EmployeeTransferFormat;
  status: EmployeeExportStatus;
  totalRows: number;
  processedRows: number;
  progressPercent: number;
  fileName: string | null;
  createdAt: string;
  completedAt: string | null;
  errorCode: string | null;
};

export type EmployeeImportStatus =
  | "AWAITING_UPLOAD"
  | "QUEUED"
  | "VALIDATING"
  | "PAUSING"
  | "PAUSED"
  | "READY_FOR_REVIEW"
  | "APPLY_QUEUED"
  | "APPLYING"
  | "CANCELLING"
  | "CANCELLED"
  | "CANCELLED_PARTIAL"
  | "COMPLETED"
  | "COMPLETED_WITH_ERRORS"
  | "FAILED"
  | "EXPIRED";

export type ImportDepartmentPlanEntry = {
  from: string;
  name: string;
  code: string;
  source: "ai" | "sheet" | "generated";
};

export type ImportPreviewSummary = {
  totalRows?: number;
  createRows?: number;
  updateRows?: number;
  unchangedRows?: number;
  invalidRows?: number;
  matchedDepartments?: string[];
  missingDepartments?: string[];
  departmentPlan?: ImportDepartmentPlanEntry[];
  warnings?: string[];
  firstErrors?: {
    row: number;
    employeeNumber: string;
    column: string;
    errorCode: string;
    message: string;
  }[];
  fatal?: string;
};

export type EmployeeImportJob = {
  id: string;
  format: EmployeeTransferFormat;
  status: EmployeeImportStatus;
  originalFileName: string;
  totalRows: number;
  validatedRows: number;
  validRows: number;
  invalidRows: number;
  createRows: number;
  updateRows: number;
  unchangedRows: number;
  processedRows: number;
  progressPercent: number;
  createdRows: number;
  updatedRows: number;
  failedRows: number;
  createMissingDepartments: boolean;
  previewSummary: ImportPreviewSummary | null;
  createdAt: string;
  validatedAt: string | null;
  completedAt: string | null;
  errorCode: string | null;
};

/** Prefer the server's lifecycle-aware value; derive only for older responses. */
export const normalizeTransferProgress = (job: {
  progressPercent?: number | null;
  processedRows?: number;
  validatedRows?: number;
  totalRows?: number;
  status?: string;
}): number => {
  if (
    typeof job.progressPercent === "number" &&
    Number.isFinite(job.progressPercent) &&
    job.progressPercent >= 0 &&
    job.progressPercent <= 100
  )
    return Math.round(job.progressPercent);

  const total = job.totalRows ?? 0;

  if (!total) return 0;
  const processed = job.status === "APPLYING" ? (job.processedRows ?? 0) : (job.validatedRows ?? 0);

  return Math.min(100, Math.round((processed / total) * 100));
};

export type CreateImportResponse = {
  import: EmployeeImportJob;
  uploadUrl: string;
  expiresAt: string;
};

export const TRANSFER_ACTIVE_EXPORT = [
  "QUEUED",
  "PROCESSING",
  "PAUSING",
  "CANCELLING",
  "FINALIZING",
] as const;

export const TRANSFER_ACTIVE_IMPORT = [
  "QUEUED",
  "VALIDATING",
  "PAUSING",
  "APPLY_QUEUED",
  "APPLYING",
  "CANCELLING",
] as const;

export const isExportActive = (status: EmployeeExportStatus): boolean =>
  (TRANSFER_ACTIVE_EXPORT as readonly string[]).includes(status);

export const isImportActive = (status: EmployeeImportStatus): boolean =>
  (TRANSFER_ACTIVE_IMPORT as readonly string[]).includes(status);
