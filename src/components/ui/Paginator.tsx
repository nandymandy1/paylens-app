"use client";

import type { FC } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import cn from "@/utils/cn";
import { getPaginationItems } from "@/utils/pagination";

type PaginatorProps = {
  className?: string;
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
};

const Paginator: FC<PaginatorProps> = ({ className, onPageChange, page, totalPages }) => {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(page, totalPages);
  const buttonClassName =
    "inline-flex size-9 items-center justify-center rounded-sm text-sm text-ink outline-none transition-colors hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus/60 disabled:pointer-events-none disabled:opacity-45";

  return (
    <nav aria-label="Pagination" className={cn("flex flex-wrap items-center gap-1", className)}>
      <button
        aria-label="First page"
        className={buttonClassName}
        disabled={page === 1}
        onClick={() => onPageChange(1)}
        type="button"
      >
        <ChevronsLeft aria-hidden="true" className="size-4" />
      </button>
      <button
        aria-label="Previous page"
        className={buttonClassName}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            aria-hidden="true"
            className="inline-flex size-9 items-center justify-center text-body"
            key={`ellipsis-${index}`}
          >
            …
          </span>
        ) : (
          <button
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={cn(
              buttonClassName,
              item === page && "bg-primary text-on-primary hover:opacity-80",
            )}
            key={item}
            onClick={() => onPageChange(item)}
            type="button"
          >
            {item}
          </button>
        ),
      )}
      <button
        aria-label="Next page"
        className={buttonClassName}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
      <button
        aria-label="Last page"
        className={buttonClassName}
        disabled={page === totalPages}
        onClick={() => onPageChange(totalPages)}
        type="button"
      >
        <ChevronsRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
};

export default Paginator;
