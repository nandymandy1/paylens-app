"use client";

import type { FC } from "react";
import ScrollReveal from "./ScrollReveal";

const PRINCIPLES = [
  {
    title: "Tenant-aware foundations",
    body: "Every query, every record, every view is scoped to your organization.",
  },
  {
    title: "Auditable compensation history",
    body: "Append-only salary records with effective dates, reasons, and actor attribution.",
  },
  {
    title: "Purposeful access controls",
    body: "Role-based permissions ensure the right people see the right compensation data.",
  },
];

const SecurityStory: FC = () => {
  return (
    <section className="relative overflow-hidden bg-cinema-bg py-28 text-cinema-text" id="security">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <ScrollReveal>
          <p className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-cinema-hero-eyebrow">
            Trust by design
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="mt-4 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] leading-tight tracking-[-0.03em] font-medium">
            Sensitive pay data deserves a clear, accountable home.
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-[1fr_1.2fr]">
          {/* Principles */}
          <div className="space-y-4">
            {PRINCIPLES.map((p, i) => (
              <ScrollReveal delay={0.15 + i * 0.08} key={p.title}>
                <div className="rounded-xl border border-cinema-card-border bg-cinema-card-bg p-5">
                  <h3 className="text-sm font-medium text-cinema-text">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-cinema-hero-subtext">{p.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Architecture visualization */}
          <ScrollReveal delay={0.2} direction="right">
            <div className="relative rounded-2xl border border-cinema-card-border bg-cinema-card-bg p-8 backdrop-blur-xl">
              <p className="mb-6 font-mono text-[10px] tracking-[0.08em] uppercase text-cinema-text-muted">
                Access architecture
              </p>
              <div className="space-y-3">
                {[
                  { label: "Organization", color: "#FC4C02", width: "100%" },
                  { label: "Membership", color: "#EF2CC1", width: "85%" },
                  { label: "Role", color: "#BDBBFF", width: "70%" },
                  { label: "Employee", color: "#C8F6F9", width: "55%" },
                  { label: "Compensation", color: "#3455FF", width: "40%" },
                ].map((item) => (
                  <div className="flex items-center gap-4" key={item.label}>
                    <span
                      className="h-2 rounded-full"
                      style={{
                        width: item.width,
                        background: `linear-gradient(90deg, ${item.color}80, ${item.color}30)`,
                      }}
                    />
                    <span className="shrink-0 font-mono text-[10px] text-cinema-text-muted">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-lg border border-cinema-card-border bg-cinema-bg-alt p-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#EF2CC1]/15">
                  <svg
                    className="size-4 text-[#EF2CC1]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-cinema-text-secondary">
                    End-to-end tenant isolation
                  </p>
                  <p className="text-[10px] text-cinema-text-muted">
                    Data never crosses organizational boundaries
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default SecurityStory;
