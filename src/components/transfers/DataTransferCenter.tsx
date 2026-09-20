"use client";

import { useState, type FC, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Download,
  FileDown,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import {
  useCancelExport,
  useCancelImport,
  useCreateExport,
  useDownloadExport,
  useDownloadImportReport,
  useEmployeeExports,
  useEmployeeImports,
  usePauseExport,
  usePauseImport,
  useResumeExport,
  useResumeImport,
} from "@/hooks/useEmployeeTransfer";
import {
  isExportActive,
  isImportActive,
  type EmployeeExportJob,
  type EmployeeImportJob,
} from "@/types/employee-transfer.type";
import cn from "@/utils/cn";

const percentOf = (processed: number, total: number): number => {
  if (!total) return 0;

  return Math.min(100, Math.round((processed / total) * 100));
};

const EXPORT_STAGE_TEXT: Record<EmployeeExportJob["status"], string> = {
  QUEUED: "Queued",
  PROCESSING: "Processing",
  PAUSING: "Pausing…",
  PAUSED: "Paused",
  CANCELLING: "Cancelling…",
  CANCELLED: "Cancelled",
  FINALIZING: "Finalizing…",
  COMPLETED: "Ready",
  FAILED: "Failed",
  EXPIRED: "Expired",
};

type Control = {
  action: "pause" | "resume" | "cancel" | "download" | "retry";
  label: string;
  icon: ReactNode;
};

const exportControls = (status: EmployeeExportJob["status"]): Control[] => {
  switch (status) {
    case "QUEUED":
      return [
        {
          action: "cancel",
          label: "Cancel export",
          icon: <X aria-hidden="true" className="size-4" />,
        },
      ];
    case "PROCESSING":
      return [
        {
          action: "pause",
          label: "Pause export",
          icon: <Pause aria-hidden="true" className="size-4" />,
        },
        {
          action: "cancel",
          label: "Cancel export",
          icon: <X aria-hidden="true" className="size-4" />,
        },
      ];
    case "PAUSED":
      return [
        {
          action: "resume",
          label: "Resume export",
          icon: <Play aria-hidden="true" className="size-4" />,
        },
        {
          action: "cancel",
          label: "Cancel export",
          icon: <X aria-hidden="true" className="size-4" />,
        },
      ];
    case "COMPLETED":
      return [
        {
          action: "download",
          label: "Download export",
          icon: <Download aria-hidden="true" className="size-4" />,
        },
      ];
    case "FAILED":
      return [
        {
          action: "retry",
          label: "Retry export",
          icon: <RotateCcw aria-hidden="true" className="size-4" />,
        },
      ];
    default:
      // PAUSING, CANCELLING, FINALIZING, CANCELLED, EXPIRED: no controls.
      return [];
  }
};

const ExportRow: FC<{
  job: EmployeeExportJob;
  busy: boolean;
  onAction: (action: Control["action"], job: EmployeeExportJob) => void;
}> = ({ job, busy, onAction }) => {
  const percent = job.progressPercent || percentOf(job.processedRows, job.totalRows);
  const active = isExportActive(job.status);

  return (
    <div className="flex gap-3 border-b border-hairline py-3 last:border-0">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-body">
        {job.status === "COMPLETED" ? (
          <Check className="size-4 text-success" />
        ) : job.status === "FAILED" ? (
          <CircleAlert className="size-4 text-danger" />
        ) : (
          <LoaderCircle className={cn("size-4", active && "animate-spin")} />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="truncate text-sm font-medium text-ink">Employee export · {job.format}</p>
        <div
          aria-label={`Export progress ${percent} percent`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percent}
          className="h-1.5 w-full overflow-hidden rounded-full bg-hairline"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-body">
          {EXPORT_STAGE_TEXT[job.status]}
          {(job.status === "PROCESSING" || job.status === "PAUSED") &&
            ` · ${percent}% · ${job.processedRows.toLocaleString()} / ${job.totalRows.toLocaleString()}`}
          {job.status === "FAILED" && job.errorCode ? ` · ${job.errorCode}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        {exportControls(job.status).map((control) => (
          <IconButton
            key={control.action}
            aria-label={control.label}
            disabled={busy}
            icon={control.icon}
            onClick={() => onAction(control.action, job)}
            size="sm"
            title={control.label}
            variant="outline"
          />
        ))}
      </div>
    </div>
  );
};

const ImportRow: FC<{ job: EmployeeImportJob }> = ({ job }) => {
  const pause = usePauseImport();
  const resume = useResumeImport();
  const cancel = useCancelImport();
  const report = useDownloadImportReport();
  const busy = pause.isPending || resume.isPending || cancel.isPending || report.isPending;
  const total = job.totalRows || job.validatedRows;
  const done =
    job.status === "APPLYING" || job.status.startsWith("COMPLETED")
      ? job.processedRows
      : job.validatedRows;
  const percent = percentOf(done, total);
  const active = isImportActive(job.status);

  const actions: { label: string; icon: ReactNode; run: () => void }[] = [];

  if (job.status === "VALIDATING" || job.status === "APPLYING") {
    actions.push({
      label: "Pause import",
      icon: <Pause aria-hidden="true" className="size-4" />,
      run: () => pause.mutate(job.id),
    });
  }

  if (job.status === "PAUSED") {
    actions.push({
      label: "Resume import",
      icon: <Play aria-hidden="true" className="size-4" />,
      run: () => resume.mutate(job.id),
    });
  }

  if (active && job.status !== "APPLY_QUEUED") {
    actions.push({
      label: "Stop import",
      icon: <X aria-hidden="true" className="size-4" />,
      run: () => cancel.mutate(job.id),
    });
  }

  if (job.status === "READY_FOR_REVIEW" || job.status === "FAILED") {
    actions.push({
      label: "Download error report",
      icon: <Download aria-hidden="true" className="size-4" />,
      run: () => report.mutate({ importId: job.id, type: "validation" }),
    });
  }

  if (job.status === "COMPLETED_WITH_ERRORS") {
    actions.push({
      label: "Download apply errors",
      icon: <Download aria-hidden="true" className="size-4" />,
      run: () => report.mutate({ importId: job.id, type: "apply" }),
    });
  }

  return (
    <div className="flex gap-3 border-b border-hairline py-3 last:border-0">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-body">
        {job.status.startsWith("COMPLETED") ? (
          <Check className="size-4 text-success" />
        ) : job.status === "FAILED" ? (
          <CircleAlert className="size-4 text-danger" />
        ) : (
          <LoaderCircle className={cn("size-4", active && "animate-spin")} />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="truncate text-sm font-medium text-ink">
          Employee import · {job.originalFileName}
        </p>
        <div
          aria-label={`Import progress ${percent} percent`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percent}
          className="h-1.5 w-full overflow-hidden rounded-full bg-hairline"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-body">
          {job.status.replaceAll("_", " ")} · {percent}%
          {job.status === "READY_FOR_REVIEW" &&
            ` · ${job.createRows} new · ${job.updateRows} updates · ${job.invalidRows} errors`}
          {job.status.startsWith("COMPLETED") &&
            ` · ${job.createdRows} created · ${job.updatedRows} updated · ${job.failedRows} failed`}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        {actions.map((action) => (
          <IconButton
            key={action.label}
            aria-label={action.label}
            disabled={busy}
            icon={action.icon}
            onClick={action.run}
            size="sm"
            title={action.label}
            variant="outline"
          />
        ))}
      </div>
    </div>
  );
};

const DataTransferCenter: FC = () => {
  const [expanded, setExpanded] = useState(true);
  const exports = useEmployeeExports();
  const imports = useEmployeeImports();
  const pauseExport = usePauseExport();
  const resumeExport = useResumeExport();
  const cancelExport = useCancelExport();
  const downloadExport = useDownloadExport();
  const createExport = useCreateExport();

  const exportJobs = exports.data ?? [];
  const importJobs = imports.data ?? [];
  const total = exportJobs.length + importJobs.length;
  const busy =
    pauseExport.isPending ||
    resumeExport.isPending ||
    cancelExport.isPending ||
    downloadExport.isPending ||
    createExport.isPending;

  if (total === 0) return null;

  const handleExportAction = (action: Control["action"], job: EmployeeExportJob): void => {
    switch (action) {
      case "pause":
        pauseExport.mutate(job.id);
        break;
      case "resume":
        resumeExport.mutate(job.id);
        break;
      case "cancel":
        cancelExport.mutate(job.id);
        break;
      case "download":
        downloadExport.mutate(job.id);
        break;
      case "retry":
        // Retry is a brand-new export of the same format; FAILED rows stay untouched.
        createExport.mutate(job.format);
        break;
    }
  };

  const activeCount = [...exportJobs, ...importJobs].filter((job) =>
    "processedRows" in job && "totalRows" in job && "fileName" in job
      ? isExportActive(job.status)
      : isImportActive(job.status as EmployeeImportJob["status"]),
  ).length;

  return (
    <section
      aria-label="Data transfers"
      className="fixed right-4 bottom-4 z-40 w-[380px] max-w-[calc(100vw-2rem)] rounded-md border border-hairline bg-surface text-ink shadow-modal"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <FileDown aria-hidden="true" className="size-4 shrink-0 text-body" />
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {activeCount > 0
            ? `${activeCount} active transfer${activeCount === 1 ? "" : "s"}`
            : "Data transfers"}
        </p>
        <IconButton
          aria-label={expanded ? "Collapse transfers" : "Expand transfers"}
          icon={
            expanded ? (
              <ChevronDown aria-hidden="true" className="size-4" />
            ) : (
              <ChevronUp aria-hidden="true" className="size-4" />
            )
          }
          onClick={() => setExpanded((previous) => !previous)}
          size="sm"
          variant="outline"
        />
      </div>
      {expanded && (
        <div className="max-h-80 overflow-y-auto border-t border-hairline px-3 pb-2">
          {exportJobs.map((job) => (
            <ExportRow key={job.id} busy={busy} job={job} onAction={handleExportAction} />
          ))}
          {importJobs.map((job) => (
            <ImportRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
};

export default DataTransferCenter;
