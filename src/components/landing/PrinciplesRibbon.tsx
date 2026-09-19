"use client";

import type { FC } from "react";
import ScrollReveal from "./ScrollReveal";
import cn from "@/utils/cn";

const PRINCIPLES = [
  { label: "Compensation clarity", icon: "01" },
  { label: "Tenant-aware", icon: "02" },
  { label: "Audit-minded", icon: "03" },
  { label: "Designed for growth", icon: "04" },
];

const PrinciplesRibbon: FC = () => {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-y border-cinema-border bg-cinema-section-alt-bg",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-x-8 gap-y-3 px-4 py-5 sm:px-8">
        {PRINCIPLES.map((p, i) => (
          <ScrollReveal delay={i * 0.08} direction="none" key={p.label}>
            <div className="flex items-center gap-3">
              <span className="flex size-6 items-center justify-center rounded-full border border-cinema-border bg-cinema-card-bg font-mono text-[9px] font-medium text-cinema-text-muted">
                {p.icon}
              </span>
              <span className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-cinema-text-secondary">
                {p.label}
              </span>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default PrinciplesRibbon;
