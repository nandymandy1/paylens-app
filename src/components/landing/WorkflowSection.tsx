"use client";

import { useEffect, useRef, type FC } from "react";
import ScrollReveal from "./ScrollReveal";

const STEPS = [
  {
    number: "01",
    title: "Organize",
    description: "Build workforce context with employees, departments, and roles.",
    visual: (
      <div className="mt-4 space-y-2">
        {["Engineering", "Marketing", "Finance"].map((dept, i) => (
          <div className="flex items-center gap-2" key={dept}>
            <span
              className="size-1.5 rounded-full"
              style={{ background: ["#FC4C02", "#EF2CC1", "#BDBBFF"][i] }}
            />
            <span className="text-[11px] text-cinema-text-secondary">{dept}</span>
            <span className="ml-auto font-mono text-[9px] text-cinema-text-muted">
              {[29, 18, 12][i]}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "02",
    title: "Understand",
    description: "Review current pay, history, and workforce context in one view.",
    visual: (
      <div className="mt-4 rounded-lg border border-cinema-card-border bg-cinema-card-bg/60 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-cinema-text-muted">Current</span>
          <span className="font-mono text-xs font-medium text-cinema-text">INR 34,00,000</span>
        </div>
        <div className="mt-2 h-px bg-cinema-border" />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-cinema-text-muted">3 changes</span>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
            +14.8%
          </span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Decide",
    description: "Make traceable compensation updates with effective dates and reasons.",
    visual: (
      <div className="mt-4 rounded-lg border border-cinema-card-border bg-cinema-card-bg/60 p-3">
        <div className="space-y-1.5">
          {["Effective date", "Reason", "Audit event"].map((label) => (
            <div className="flex items-center gap-2" key={label}>
              <svg className="size-3 text-[#BDBBFF]" fill="none" viewBox="0 0 12 12">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[10px] text-cinema-text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const WorkflowSection: FC = () => {
  const connectorRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      const line = connectorRef.current?.querySelector(".connector-line");

      if (!line) return;

      gsap.fromTo(
        line,
        { strokeDashoffset: 600 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: connectorRef.current,
            start: "top 70%",
            end: "bottom 40%",
            scrub: 0.5,
          },
        },
      );
    };

    loadGSAP();
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-cinema-section-alt-bg py-28 text-cinema-text"
      id="how-it-works"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <ScrollReveal>
          <p className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-cinema-hero-eyebrow">
            How it works
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="mt-4 text-[clamp(1.8rem,4vw,3rem)] leading-tight tracking-[-0.03em] font-medium">
            From workforce data to
            <br />
            compensation clarity.
          </h2>
        </ScrollReveal>

        <div className="relative mt-16">
          {/* Connecting line */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-[23px] top-0 hidden h-full w-px md:block"
            ref={connectorRef}
          >
            <line
              className="connector-line"
              stroke="url(#workflow-grad)"
              strokeWidth="1"
              strokeDasharray="600"
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="100%"
            />
            <defs>
              <linearGradient id="workflow-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FC4C02" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#BDBBFF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3455FF" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>

          <div className="space-y-8 md:space-y-12">
            {STEPS.map((step, i) => (
              <ScrollReveal delay={0.1 + i * 0.12} key={step.number}>
                <div className="flex gap-6 md:gap-10">
                  <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-cinema-border bg-cinema-bg">
                    <span className="font-mono text-xs font-medium text-cinema-text-muted">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex-1 rounded-xl border border-cinema-card-border bg-cinema-card-bg p-6 transition-[border-color] duration-300 hover:border-cinema-border-strong">
                    <h3 className="text-lg font-medium text-cinema-text">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-cinema-hero-subtext">
                      {step.description}
                    </p>
                    {step.visual}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
