"use client";

import type { FC } from "react";

type BrandRibbonProps = {
  className?: string;
};

const BrandRibbon: FC<BrandRibbonProps> = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    className={`pointer-events-none ${className}`}
    fill="none"
    viewBox="0 0 800 120"
  >
    <defs>
      <linearGradient id="ribbon-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FC4C02" stopOpacity="0.6" />
        <stop offset="35%" stopColor="#EF2CC1" stopOpacity="0.5" />
        <stop offset="68%" stopColor="#BDBBFF" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#C8F6F9" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <path
      d="M0 60 Q200 20 400 60 Q600 100 800 60"
      stroke="url(#ribbon-grad)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M0 65 Q200 25 400 65 Q600 105 800 65"
      stroke="url(#ribbon-grad)"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

export default BrandRibbon;
