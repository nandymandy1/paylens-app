import type { FC, ReactNode } from "react";
import Button from "@/components/ui/Button";
import cn from "@/utils/cn";

type FilterToolbarProps = {
  ariaLabel: string;
  search: ReactNode;
  controls: ReactNode[];
  showClear?: boolean;
  clearLabel?: string;
  className?: string;
  onClear?: () => void;
};

const FilterToolbar: FC<FilterToolbarProps> = ({
  ariaLabel,
  search,
  controls,
  showClear = false,
  onClear,
  clearLabel = "Clear",
  className,
}) => (
  <div className="flex flex-col gap-2 rounded-sm border border-hairline bg-surface p-2">
    <div
      role="search"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <div className="min-w-44 flex-[2_1_16rem]">{search}</div>
      {controls.map((control, index) => (
        <div key={index} className="min-w-28 flex-1 basis-32">
          {control}
        </div>
      ))}
    </div>
    {showClear && (
      <div className="flex items-center justify-end">
        <Button onClick={onClear} size="sm" type="button" variant="ghost">
          {clearLabel}
        </Button>
      </div>
    )}
  </div>
);

export default FilterToolbar;
