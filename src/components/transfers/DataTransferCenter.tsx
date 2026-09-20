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
import EmployeeImportWizard from "@/components/transfers/EmployeeImportWizard";
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
  normalizeTransferProgress,
} from "@/types/employee-transfer.type";
import cn from "@/utils/cn";

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

const IMPORT_STAGE_TEXT: Record<EmployeeImportJob["status"], string> = {
  AWAITING_UPLOAD: "Awaiting upload",
  QUEUED: "Queued",
  VALIDATING: "Validating file",
  PAUSING: "Pausing…",
  PAUSED: "Paused",
  READY_FOR_REVIEW: "Review required",
  APPLY_QUEUED: "Queued to apply",
  APPLYING: "Applying changes",
  CANCELLING: "Cancelling…",
  CANCELLED: "Cancelled",
  CANCELLED_PARTIAL: "Cancelled with partial changes",
  COMPLETED: "Completed",
  COMPLETED_WITH_ERRORS: "Completed with errors",
  FAILED: "Failed",
  EXPIRED: "Expired",
};

const isTerminal = (status: string): boolean =>
  [
    "COMPLETED",
    "COMPLETED_WITH_ERRORS",
    "FAILED",
    "CANCELLED",
    "CANCELLED_PARTIAL",
    "EXPIRED",
  ].includes(status);

const dismissKey = (kind: "export" | "import", id: string): string => `${kind}:${id}`;

const isActiveBadgeStatus = (status: string): boolean =>
  status === "PAUSED" ||
  isExportActive(status as EmployeeExportJob["status"]) ||
  isImportActive(status as EmployeeImportJob["status"]);

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
  onDismiss: () => void;
}> = ({ job, busy, onAction, onDismiss }) => {
  const percent = normalizeTransferProgress(job);
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
        {isTerminal(job.status) && (
          <IconButton
            aria-label="Dismiss export"
            icon={<X aria-hidden="true" className="size-4" />}
            onClick={onDismiss}
            size="sm"
            title="Dismiss"
            variant="outline"
          />
        )}
      </div>
    </div>
  );
};

const ImportRow: FC<{ job: EmployeeImportJob; onDismiss: () => void; onReview: () => void }> = ({
  job,
  onDismiss,
  onReview,
}) => {
  const pause = usePauseImport();
  const resume = useResumeImport();
  const cancel = useCancelImport();
  const report = useDownloadImportReport();
  const busy = pause.isPending || resume.isPending || cancel.isPending || report.isPending;
  const percent = normalizeTransferProgress(job);
  const active = isImportActive(job.status);

  const actions: { label: string; icon: ReactNode; run: () => void }[] = [];

  if (job.status === "APPLYING") {
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

  if (["VALIDATING", "APPLY_QUEUED", "APPLYING", "PAUSED"].includes(job.status)) {
    actions.push({
      label: "Stop import",
      icon: <X aria-hidden="true" className="size-4" />,
      run: () => cancel.mutate(job.id),
    });
  }

  if (job.status === "READY_FOR_REVIEW") {
    actions.push({
      label: "Download error report",
      icon: <Download aria-hidden="true" className="size-4" />,
      run: () => report.mutate({ importId: job.id, type: "validation" }),
    });
  }

  if (job.status === "READY_FOR_REVIEW") {
    actions.unshift({
      label: "Review import",
      icon: <Play aria-hidden="true" className="size-4" />,
      run: onReview,
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
          {IMPORT_STAGE_TEXT[job.status]} · {percent}%
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
        {isTerminal(job.status) && (
          <IconButton
            aria-label="Dismiss import"
            icon={<X aria-hidden="true" className="size-4" />}
            onClick={onDismiss}
            size="sm"
            title="Dismiss"
            variant="outline"
          />
        )}
      </div>
    </div>
  );
};

const DataTransferCenter: FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(sessionStorage.getItem("paylens-dismissed-transfers") ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  const [reviewImportId, setReviewImportId] = useState<string | null>(null);
  const exports = useEmployeeExports();
  const imports = useEmployeeImports();
  const pauseExport = usePauseExport();
  const resumeExport = useResumeExport();
  const cancelExport = useCancelExport();
  const downloadExport = useDownloadExport();
  const createExport = useCreateExport();

  const dismiss = (key: string): void => {
    setDismissed((previous) => {
      const next = [...new Set([...previous, key])];

      sessionStorage.setItem("paylens-dismissed-transfers", JSON.stringify(next));

      return next;
    });
  };
  const exportJobs = (exports.data ?? []).filter(
    (job) => !dismissed.includes(dismissKey("export", job.id)),
  );
  const importJobs = (imports.data ?? []).filter(
    (job) => !dismissed.includes(dismissKey("import", job.id)),
  );
  const activeExports = exportJobs.filter((job) => isActiveBadgeStatus(job.status));
  const activeImports = importJobs.filter(
    (job) => isActiveBadgeStatus(job.status) && job.status !== "READY_FOR_REVIEW",
  );
  const attentionImports = importJobs.filter((job) => job.status === "READY_FOR_REVIEW");
  const recent = [
    ...exportJobs.map((job) => ({ kind: "export" as const, job })),
    ...importJobs.map((job) => ({ kind: "import" as const, job })),
  ]
    .filter(({ job }) => isTerminal(job.status))
    .sort((a, b) => new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime())
    .slice(0, 5);
  const busy =
    pauseExport.isPending ||
    resumeExport.isPending ||
    cancelExport.isPending ||
    downloadExport.isPending ||
    createExport.isPending;

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

  const activeCount = activeExports.length + activeImports.length + attentionImports.length;

  if (activeCount === 0 && recent.length === 0) return null;

  const panel = (
    <section
      aria-label="Data transfers"
      className={cn(
        "z-40 w-[380px] max-w-[calc(100vw-2rem)] rounded-md border border-hairline bg-surface text-ink shadow-modal",
        "absolute top-11 right-0",
      )}
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
          {activeCount === 0 && recent.length === 0 && (
            <p className="py-4 text-sm text-body">No recent activity</p>
          )}
          {activeExports.length + activeImports.length > 0 && (
            <p className="pt-3 text-xs font-medium text-body">ACTIVE</p>
          )}
          {activeExports.map((job) => (
            <ExportRow
              key={job.id}
              busy={busy}
              job={job}
              onAction={handleExportAction}
              onDismiss={() => dismiss(dismissKey("export", job.id))}
            />
          ))}
          {activeImports.map((job) => (
            <ImportRow
              key={job.id}
              job={job}
              onDismiss={() => dismiss(dismissKey("import", job.id))}
              onReview={() => setReviewImportId(job.id)}
            />
          ))}
          {attentionImports.length > 0 && (
            <p className="pt-3 text-xs font-medium text-body">NEEDS ATTENTION</p>
          )}
          {attentionImports.map((job) => (
            <ImportRow
              key={job.id}
              job={job}
              onDismiss={() => dismiss(dismissKey("import", job.id))}
              onReview={() => setReviewImportId(job.id)}
            />
          ))}
          {recent.length > 0 && <p className="pt-3 text-xs font-medium text-body">RECENT</p>}
          {recent.map(({ kind, job }) =>
            kind === "export" ? (
              <ExportRow
                key={job.id}
                busy={busy}
                job={job}
                onAction={handleExportAction}
                onDismiss={() => dismiss(dismissKey("export", job.id))}
              />
            ) : (
              <ImportRow
                key={job.id}
                job={job}
                onDismiss={() => dismiss(dismissKey("import", job.id))}
                onReview={() => setReviewImportId(job.id)}
              />
            ),
          )}
        </div>
      )}
      {reviewImportId && (
        <EmployeeImportWizard
          importId={reviewImportId}
          onClose={() => setReviewImportId(null)}
          open
        />
      )}
    </section>
  );

  return (
    <div className="relative">
      <button
        aria-label="Open data transfers"
        className="relative inline-flex size-9 items-center justify-center rounded-sm border border-hairline text-body transition-colors hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        onClick={() => setExpanded((previous) => !previous)}
        type="button"
      >
        <FileDown aria-hidden="true" className="size-4" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] leading-4 text-surface">
            {activeCount}
          </span>
        )}
      </button>
      {expanded && panel}
    </div>
  );
};

export default DataTransferCenter;
