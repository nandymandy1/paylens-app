"use client";

import type { FC } from "react";

type DataGridProps = {
  className?: string;
};

const DataGrid: FC<DataGridProps> = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    className={`pointer-events-none ${className}`}
    fill="none"
    viewBox="0 0 400 400"
  >
    <defs>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="0.5" cy="0.5" r="0.5" fill="currentColor" opacity="0.15" />
      </pattern>
      <radialGradient id="grid-mask" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="white" stopOpacity="1" />
        <stop offset="80%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <mask id="grid-fade">
        <rect width="400" height="400" fill="url(#grid-mask)" />
      </mask>
    </defs>
    <rect width="400" height="400" fill="url(#grid)" mask="url(#grid-fade)" />
  </svg>
);

export default DataGrid;
