"use client";

import { useRef, useState, type FC } from "react";
import { Upload, X } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Modal from "@/components/ui/Modal";
import {
  useConfirmImport,
  useDownloadImportReport,
  useEmployeeImportJob,
  useStartImport,
} from "@/hooks/useEmployeeTransfer";

const MAX_BYTES = 25 * 1024 * 1024;

type EmployeeImportWizardProps = {
  open: boolean;
  onClose: () => void;
  importId?: string | null;
};

const EmployeeImportWizard: FC<EmployeeImportWizardProps> = ({
  open,
  onClose,
  importId: initialImportId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [createMissing, setCreateMissing] = useState(true);
  const [importId, setImportId] = useState<string | null>(initialImportId ?? null);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const start = useStartImport();
  const confirm = useConfirmImport();
  const report = useDownloadImportReport();
  const jobQuery = useEmployeeImportJob(open ? importId : null);
  const job = jobQuery.data ?? null;

  const handleClose = (): void => {
    setFile(null);
    setLocalError(null);
    setImportId(initialImportId ?? null);
    setCreateMissing(true);
    onClose();
  };

  const clearFile = (): void => {
    setFile(null);

    if (inputRef.current) inputRef.current.value = "";
  };

  const pickFile = (next: File | null): void => {
    setLocalError(null);

    if (!next) {
      setFile(null);

      return;
    }

    const lowered = next.name.toLowerCase();
    const accepted = lowered.endsWith(".csv") || lowered.endsWith(".xlsx");

    if (!accepted) {
      setLocalError("Only .csv and .xlsx files are accepted.");
      setFile(null);

      return;
    }

    if (next.size > MAX_BYTES) {
      setLocalError("File exceeds the 25 MB import limit.");
      setFile(null);

      return;
    }

    setFile(next);
  };

  const upload = (): void => {
    if (!file || start.isPending) return;

    setLocalError(null);
    start.mutate(file, {
      onSuccess: (result) => {
        setImportId(result.id);
      },
      onError: (error) => {
        // Show the real backend/storage message (e.g. state conflict, missing
        // object) instead of a generic string that hides the cause.
        setLocalError(
          error instanceof Error && error.message
            ? error.message
            : "Upload failed. Check the file and try again.",
        );
      },
    });
  };

  const status = job?.status ?? null;
  const reviewing = status === "READY_FOR_REVIEW";
  const summary = job?.previewSummary ?? null;
  const blocked =
    reviewing &&
    ((job?.invalidRows ?? 0) > 0 ||
      ((summary?.missingDepartments?.length ?? 0) > 0 && !createMissing));
  const missing = summary?.missingDepartments ?? [];
  const planByFrom = new Map((summary?.departmentPlan ?? []).map((entry) => [entry.from, entry]));

  return (
    <Modal
      description="Upload a CSV or XLSX file, review validation, then confirm."
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
      open={open}
      size="lg"
      title="Import employees"
      footer={
        <>
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
          {!job && (
            <Button disabled={!file || start.isPending} loading={start.isPending} onClick={upload}>
              {start.isPending ? "Uploading…" : "Upload and validate"}
            </Button>
          )}
          {reviewing && !blocked && (
            <Button
              disabled={confirm.isPending}
              onClick={() =>
                job && confirm.mutate({ importId: job.id, createMissingDepartments: createMissing })
              }
            >
              {confirm.isPending ? "Confirming…" : "Confirm import"}
            </Button>
          )}
        </>
      }
    >
      {localError && <Alert variant="danger">{localError}</Alert>}

      {!job && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink">Employee file (.csv or .xlsx, max 25 MB)</p>
          <input
            ref={inputRef}
            accept=".csv,.xlsx"
            aria-label="Choose employee file"
            className="hidden"
            disabled={start.isPending}
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
            type="file"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={start.isPending}
              onClick={() => inputRef.current?.click()}
              prefixIcon={<Upload aria-hidden="true" className="size-4" />}
              variant="outline"
            >
              Choose file
            </Button>
            {file ? (
              <span className="inline-flex max-w-full items-center gap-2 rounded-sm border border-hairline bg-surface-subtle px-2 py-1 text-xs text-ink">
                <span className="truncate">
                  {file.name} · {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  aria-label="Remove file"
                  className="shrink-0 rounded-sm text-body hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60"
                  onClick={clearFile}
                  type="button"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              </span>
            ) : (
              <span className="text-xs text-body">No file chosen</span>
            )}
          </div>
          <p className="text-xs text-body">
            Tip: export the current directory to get a correctly shaped template.
          </p>
        </div>
      )}

      {job && !reviewing && !status?.startsWith("COMPLETED") && status !== "FAILED" && (
        <p className="text-sm text-body">
          {status === "VALIDATING" || status === "QUEUED"
            ? `Validating ${job.validatedRows.toLocaleString()} / ${job.totalRows.toLocaleString()} rows…`
            : status === "APPLYING" || status === "APPLY_QUEUED"
              ? `Applying ${job.processedRows.toLocaleString()} / ${job.totalRows.toLocaleString()} rows…`
              : "Working…"}
        </p>
      )}

      {reviewing && job && summary && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink">
            {summary.createRows ?? 0} new · {summary.updateRows ?? 0} updates ·{" "}
            {summary.unchangedRows ?? 0} unchanged · {job.invalidRows} errors
          </p>
          {missing.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-ink">Department mapping</p>
              <ul className="list-disc pl-5 text-sm text-body">
                {missing.map((name) => {
                  const planned = planByFrom.get(name);

                  return (
                    <li key={name}>
                      {planned && planned.name !== name
                        ? `${name} → ${planned.name} (${planned.code})`
                        : planned
                          ? `${planned.name} (${planned.code})`
                          : name}
                    </li>
                  );
                })}
              </ul>
              <Checkbox
                checked={createMissing}
                label="Create missing departments"
                onChange={(event) => setCreateMissing(event.target.checked)}
              />
            </div>
          )}
          {blocked && (
            <>
              <Alert variant="danger">
                {job.invalidRows > 0
                  ? `Fix ${job.invalidRows} invalid rows and start a new import. Confirmation is disabled.`
                  : "Choose to create missing departments before confirming this import."}
              </Alert>
              <Button
                disabled={report.isPending}
                onClick={() => report.mutate({ importId: job.id, type: "validation" })}
                variant="outline"
              >
                Download error report
              </Button>
            </>
          )}
        </div>
      )}

      {status === "FAILED" && (
        <Alert variant="danger">{summary?.fatal ?? "Validation failed."}</Alert>
      )}

      {status?.startsWith("COMPLETED") && job && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink">
            {job.createdRows} created · {job.updatedRows} updated · {job.failedRows} failed
          </p>
          {status === "COMPLETED_WITH_ERRORS" && (
            <Button
              disabled={report.isPending}
              onClick={() => report.mutate({ importId: job.id, type: "apply" })}
              variant="outline"
            >
              Download apply errors
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
};

export default EmployeeImportWizard;
