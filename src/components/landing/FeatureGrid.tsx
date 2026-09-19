"use client";

import { BarChart3, Building2, ShieldCheck } from "lucide-react";
import type { FC } from "react";
import ScrollReveal from "./ScrollReveal";

const FEATURES = [
  {
    icon: BarChart3,
    eyebrow: "Compensation",
    title: "A clearer view of pay",
    body: "Current pay and historical context, deliberately organized for understanding.",
    visual: (
      <div className="mt-4 rounded-lg border border-cinema-card-border bg-cinema-card-bg/60 p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cinema-text-muted">Current</span>
            <span className="font-mono text-xs font-medium text-cinema-text">INR 34,00,000</span>
          </div>
          <div className="h-px bg-cinema-border" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cinema-text-muted">History</span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
              +14.8%
            </span>
          </div>
          <div className="flex gap-1">
            {[0.6, 0.45, 0.3, 0.5, 0.7].map((h, i) => (
              <div className="flex-1" key={i}>
                <div
                  className="rounded-sm bg-gradient-to-t from-[#FC4C02]/40 to-[#EF2CC1]/30"
                  style={{ height: `${h * 32}px` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Building2,
    eyebrow: "Workforce",
    title: "Context across your organization",
    body: "Teams, roles, and locations connected to every compensation decision.",
    visual: (
      <div className="mt-4 rounded-lg border border-cinema-card-border bg-cinema-card-bg/60 p-3">
        <div className="flex flex-wrap gap-1.5">
          {["Marketing", "Engineering", "Finance", "Operations"].map((dept) => (
            <span
              className="rounded-full border border-cinema-border bg-cinema-card-bg px-2.5 py-1 text-[10px] text-cinema-text-secondary"
              key={dept}
            >
              {dept}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-[#BDBBFF]/40 to-transparent" />
          <span className="text-[9px] text-cinema-text-muted">connected</span>
          <div className="h-px flex-1 bg-gradient-to-l from-[#BDBBFF]/40 to-transparent" />
        </div>
        <div className="mt-2 flex gap-1.5">
          {["L1", "L2", "L3", "L4", "L5"].map((level) => (
            <span
              className="rounded border border-cinema-border bg-cinema-card-bg px-1.5 py-0.5 font-mono text-[9px] text-cinema-text-muted"
              key={level}
            >
              {level}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    eyebrow: "Auditability",
    title: "Confidence in every decision",
    body: "Traceable history, purposeful access, and deliberate compensation governance.",
    visual: (
      <div className="mt-4 rounded-lg border border-cinema-card-border bg-cinema-card-bg/60 p-3">
        <div className="space-y-1.5">
          {[
            { label: "Organization", color: "bg-[#FC4C02]/50" },
            { label: "Membership", color: "bg-[#EF2CC1]/50" },
            { label: "Role", color: "bg-[#BDBBFF]/60" },
            { label: "Employee", color: "bg-[#C8F6F9]/60" },
          ].map((item, i) => (
            <div className="flex items-center gap-2" key={item.label}>
              <span className={`size-1.5 rounded-full ${item.color}`} />
              <span className="text-[10px] text-cinema-text-secondary">{item.label}</span>
              {i < 3 && (
                <svg
                  className="ml-auto size-3 text-cinema-text-faint"
                  fill="none"
                  viewBox="0 0 12 12"
                >
                  <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const FeatureGrid: FC = () => {
  return (
    <section
      className="relative overflow-hidden bg-cinema-section-alt-bg py-24 text-cinema-text"
      id="product"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <ScrollReveal>
          <p className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-cinema-hero-eyebrow">
            The PayLens approach
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="mt-4 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] leading-tight tracking-[-0.03em] font-medium">
            Understand how your organization pays.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <p className="mt-4 max-w-xl text-base leading-7 text-cinema-hero-subtext">
            PayLens is designed for the work that follows a compensation decision — not just the
            number itself.
          </p>
        </ScrollReveal>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <ScrollReveal delay={0.1 + i * 0.1} key={feature.title}>
              <article className="group relative h-full rounded-xl border border-cinema-card-border bg-cinema-card-bg p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-cinema-border-strong hover:shadow-cinema-card-hover">
                <feature.icon className="size-5 text-cinema-text-muted" />
                <p className="mt-6 font-mono text-[10px] font-medium tracking-[0.08em] uppercase text-cinema-hero-eyebrow">
                  {feature.eyebrow}
                </p>
                <h3 className="mt-2 text-lg tracking-tight text-cinema-text">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-cinema-hero-subtext">{feature.body}</p>
                {feature.visual}
                {/* Subtle brand edge on hover */}
                <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-xl bg-gradient-to-r from-transparent via-[#EF2CC1]/0 to-transparent transition-all duration-300 group-hover:via-[#EF2CC1]/20" />
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
