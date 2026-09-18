import type { FC, ReactNode } from "react";
import Button from "@/components/ui/Button";
import cn from "@/utils/cn";

type FilterToolbarProps = {
  /** Accessible label for the toolbar region. */
  ariaLabel: string;
  /** Search control. Grows to fill available space; full row on small screens. */
  search: ReactNode;
  /** Filter/sort controls. Each cell flexes uniformly and wraps to at most two lines. */
  controls: ReactNode[];
  /** Rendered only when true so clearing stays a deliberate empty-state action. */
  showClear?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  className?: string;
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
  <div
    aria-label={ariaLabel}
    className={cn(
      "flex flex-wrap items-center gap-2 rounded-sm border border-hairline bg-surface p-2",
      className,
    )}
    role="search"
  >
    <div className="min-w-44 flex-[2_1_16rem]">{search}</div>
    {controls.map((control, index) => (
      // Static control slots: order never changes, so index keys are stable.
      <div key={index} className="min-w-28 flex-1 basis-32">
        {control}
      </div>
    ))}
    {showClear && (
      <Button onClick={onClear} size="sm" type="button" variant="ghost">
        {clearLabel}
      </Button>
    )}
  </div>
);

export default FilterToolbar;
