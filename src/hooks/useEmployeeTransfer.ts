import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import useAuthSessionStore from "@/stores/auth-session";
import {
  cancelExport,
  cancelImport,
  completeImportUpload,
  confirmImport,
  createExport,
  createImport,
  fetchExport,
  fetchExportDownloadUrl,
  fetchExports,
  fetchImport,
  fetchImportReportUrl,
  fetchImports,
  pauseExport,
  pauseImport,
  resumeExport,
  resumeImport,
  transferKeys,
  uploadFileToSignedUrl,
} from "@/services/employee-transfer.service";
import {
  isExportActive,
  isImportActive,
  type EmployeeExportJob,
  type EmployeeTransferFormat,
} from "@/types/employee-transfer.type";

const authEnabled = (status: string, organizationId: string | undefined, extra = true): boolean =>
  (status === "authenticated" || status === "unknown") && Boolean(organizationId) && extra;

const describeError = (error: unknown, fallback: string): string =>
  error instanceof ApiError ? error.message : fallback;

export const useEmployeeExports = () => {
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;

  const query = useQuery({
    queryKey: transferKeys.exports(organizationId),
    queryFn: fetchExports,
    enabled: authEnabled(sessionStatus, organizationId),
    // One shared poller for the whole transfer center; stops when all terminal.
    refetchInterval: (query) => {
      const jobs = (query.state.data ?? []) as EmployeeExportJob[];

      return jobs.some((job) => isExportActive(job.status)) ? 2000 : false;
    },
  });

  return query;
};

export const useEmployeeImports = () => {
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;

  return useQuery({
    queryKey: transferKeys.imports(organizationId),
    queryFn: fetchImports,
    enabled: authEnabled(sessionStatus, organizationId),
    refetchInterval: (query) => {
      const jobs = (query.state.data ?? []) as { status: string }[];

      return jobs.some((job) => isImportActive(job.status as never)) ? 2000 : false;
    },
  });
};

export const useEmployeeExportJob = (exportId: string | null) => {
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;

  return useQuery({
    queryKey: transferKeys.exportDetail(organizationId, exportId ?? ""),
    queryFn: () => fetchExport(exportId as string),
    enabled: authEnabled(sessionStatus, organizationId, Boolean(exportId)),
    refetchInterval: (query) => {
      const job = query.state.data as EmployeeExportJob | undefined;

      return job && isExportActive(job.status) ? 2000 : false;
    },
  });
};

export const useEmployeeImportJob = (importId: string | null) => {
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;

  return useQuery({
    queryKey: transferKeys.importDetail(organizationId, importId ?? ""),
    queryFn: () => fetchImport(importId as string),
    enabled: authEnabled(sessionStatus, organizationId, Boolean(importId)),
    refetchInterval: (query) => {
      const job = query.state.data as { status: string } | undefined;

      return job && isImportActive(job.status as never) ? 2000 : false;
    },
  });
};

const useInvalidateTransfers = () => {
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const organizationId = session?.activeOrganization?.id;

  return () => {
    void queryClient.invalidateQueries({ queryKey: transferKeys.exports(organizationId) });
    void queryClient.invalidateQueries({ queryKey: transferKeys.imports(organizationId) });
  };
};

export const useCreateExport = () => {
  const invalidate = useInvalidateTransfers();

  return useMutation({
    mutationFn: (format: EmployeeTransferFormat) => createExport(format),
    onSuccess: (job) => {
      toast.success(`Export started (${job.format}). Track progress in Data transfers.`);
      invalidate();
    },
    onError: (error) => {
      toast.error(describeError(error, "Could not start the export."));
    },
  });
};

export const usePauseExport = () => {
  const invalidate = useInvalidateTransfers();

  return useMutation({
    mutationFn: pauseExport,
    onSuccess: () => {
      toast.success("Export pausing after the current batch.");
      invalidate();
    },
    onError: (error) => {
      toast.error(describeError(error, "Could not pause the export."));
    },
  });
};

export const useResumeExport = () => {
  const invalidate = useInvalidateTransfers();

  return useMutation({
    mutationFn: resumeExport,
    onSuccess: () => {
      toast.success("Export resumed.");
      invalidate();
    },
    onError: (error) => {
      toast.error(describeError(error, "Could not resume the export."));
    },
  });
};

export const useCancelExport = () => {
  const invalidate = useInvalidateTransfers();

  return useMutation({
    mutationFn: cancelExport,
    onSuccess: () => {
      toast.success("Export cancelled.");
      invalidate();
    },
    onError: (error) => {
      toast.error(describeError(error, "Could not cancel the export."));
    },
  });
};

export const useDownloadExport = () => {
  return useMutation({
    mutationFn: async (exportId: string) => {
      const { url } = await fetchExportDownloadUrl(exportId);

      window.open(url, "_blank", "noopener");
    },
    onError: (error) => {
      toast.error(describeError(error, "Download is not available yet."));
    },
  });
};

export const useStartImport = () => {
  const invalidate = useInvalidateTransfers();

  return useMutation({
    mutationFn: async (file: File) => {
      const lowered = file.name.toLowerCase();
      const format: EmployeeTransferFormat = lowered.endsWith(".xlsx") ? "XLSX" : "CSV";
      const contentType =
        format === "CSV"
          ? "text/csv; charset=utf-8"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      // Step 1 (backend): mint the import record + presigned PUT URL.
      const created = await createImport({
        fileName: file.name,
        format,
        sizeBytes: file.size,
        contentType,
      });

      // Step 2 (frontend only): stream the bytes straight to storage.
      try {
        await uploadFileToSignedUrl(created.uploadUrl, file, contentType);
      } catch {
        throw new Error(
          "File upload to storage failed. Check your connection and try again.",
        );
      }

      // Step 3 (backend): verify the object and start validation/processing.
      return completeImportUpload(created.import.id);
    },
    onSuccess: () => {
      toast.success("Upload complete. Validation started.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not upload the import file.",
      );
    },
  });
};

export const useConfirmImport = () => {
  const invalidate = useInvalidateTransfers();

  return useMutation({
    mutationFn: (input: { importId: string; createMissingDepartments: boolean }) =>
      confirmImport(input.importId, input.createMissingDepartments),
    onSuccess: () => {
      toast.success("Import confirmed. Applying in the background.");
      invalidate();
    },
    onError: (error) => {
      toast.error(describeError(error, "Could not confirm the import."));
    },
  });
};

export const usePauseImport = () => {
  const invalidate = useInvalidateTransfers();

  return useMutation({
    mutationFn: pauseImport,
    onSuccess: () => {
      toast.success("Import pausing after the current batch.");
      invalidate();
    },
    onError: (error) => {
      toast.error(describeError(error, "Could not pause the import."));
    },
  });
};

export const useResumeImport = () => {
  const invalidate = useInvalidateTransfers();

  return useMutation({
    mutationFn: resumeImport,
    onSuccess: () => {
      toast.success("Import resumed.");
      invalidate();
    },
    onError: (error) => {
      toast.error(describeError(error, "Could not resume the import."));
    },
  });
};

export const useCancelImport = () => {
  const invalidate = useInvalidateTransfers();

  return useMutation({
    mutationFn: cancelImport,
    onSuccess: () => {
      toast.success("Import stopped. Applied rows are kept.");
      invalidate();
    },
    onError: (error) => {
      toast.error(describeError(error, "Could not stop the import."));
    },
  });
};

export const useDownloadImportReport = () => {
  return useMutation({
    mutationFn: async (input: { importId: string; type: "validation" | "apply" }) => {
      const { url } = await fetchImportReportUrl(input.importId, input.type);

      window.open(url, "_blank", "noopener");
    },
    onError: (error) => {
      toast.error(describeError(error, "Report is not available yet."));
    },
  });
};
