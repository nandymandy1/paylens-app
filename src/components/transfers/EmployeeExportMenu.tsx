"use client";

import { useState, type FC } from "react";
import { ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import Popover from "@/components/ui/Popover";
import { useCreateExport } from "@/hooks/useEmployeeTransfer";
import type { EmployeeTransferFormat } from "@/types/employee-transfer.type";

type EmployeeExportMenuProps = {
  disabled?: boolean;
};

const EmployeeExportMenu: FC<EmployeeExportMenuProps> = ({ disabled = false }) => {
  const [open, setOpen] = useState(false);
  const createExport = useCreateExport();

  const start = (format: EmployeeTransferFormat): void => {
    if (createExport.isPending) return;

    setOpen(false);
    createExport.mutate(format);
  };

  return (
    <Popover
      align="end"
      content={
        <div className="flex flex-col gap-1">
          <p className="px-2 py-1 font-mono text-[11px] tracking-[0.08em] text-body uppercase">
            Export format
          </p>
          <Button
            block
            disabled={createExport.isPending}
            loading={createExport.isPending}
            onClick={() => start("CSV")}
            variant="outline"
          >
            Export CSV
          </Button>
          <Button
            block
            disabled={createExport.isPending}
            onClick={() => start("XLSX")}
            variant="outline"
          >
            Export Excel (.xlsx)
          </Button>
        </div>
      }
      onOpenChange={setOpen}
      open={open}
    >
      <Button
        disabled={disabled}
        suffixIcon={<ChevronDown aria-hidden="true" className="size-4" />}
        variant="outline"
      >
        Export
      </Button>
    </Popover>
  );
};

export default EmployeeExportMenu;
