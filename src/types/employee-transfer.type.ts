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

export type ImportPreviewSummary = {
  totalRows?: number;
  createRows?: number;
  updateRows?: number;
  unchangedRows?: number;
  invalidRows?: number;
  matchedDepartments?: string[];
  missingDepartments?: string[];
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
