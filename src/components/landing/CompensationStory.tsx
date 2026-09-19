"use client";

import { useEffect, useRef, type FC } from "react";
import ScrollReveal from "./ScrollReveal";
import useThemeStore from "@/stores/theme";
import cn from "@/utils/cn";

const TIMELINE = [
  {
    year: "2026",
    event: "Annual Review",
    salary: "INR 34,00,000",
    delta: "+14.8%",
    positive: true,
  },
  {
    year: "2025",
    event: "Promotion",
    salary: "INR 28,00,000",
    delta: "+11.2%",
    positive: true,
  },
  {
    year: "2024",
    event: "Market adjustment",
    salary: "INR 25,20,000",
    delta: "+8.0%",
    positive: true,
  },
  {
    year: "2023",
    event: "Initial",
    salary: "INR 23,30,000",
    delta: null,
    positive: false,
  },
];

const CompensationStory: FC = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      const el = timelineRef.current;

      if (!el) return;

      const items = el.querySelectorAll(".timeline-item");
      const line = el.querySelector(".timeline-line-fill");

      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 70%",
              end: "bottom 50%",
              scrub: 0.5,
            },
          },
        );
      }

      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    };

    loadGSAP();
  }, []);

  return (
    <section className="relative overflow-hidden bg-cinema-section-alt-bg py-28 text-cinema-text">
      <div className="mx-auto grid max-w-6xl gap-16 px-4 sm:px-8 md:grid-cols-2">
        <div>
          <ScrollReveal>
            <p className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-cinema-hero-eyebrow">
              Compensation history
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 text-[clamp(1.8rem,4vw,3rem)] leading-tight tracking-[-0.03em] font-medium">
              Every change tells a story.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-5 max-w-md text-base leading-7 text-cinema-hero-subtext">
              Append-only compensation history with effective dates, reasons, and actors — so every
              decision is traceable and every number has context.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-cinema-card-border bg-cinema-card-bg px-4 py-2">
              <span className="size-2 rounded-full bg-[#EF2CC1]" />
              <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-cinema-text-muted">
                Demo illustration — not real data
              </span>
            </div>
          </ScrollReveal>
        </div>
        <div ref={timelineRef} className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-cinema-timeline-line">
            <div
              className="timeline-line-fill absolute inset-x-0 top-0 origin-top bg-gradient-to-b from-[#EF2CC1] via-[#BDBBFF] to-[#3455FF]"
              style={{ height: "100%", transform: "scaleY(0)", opacity: 0.5 }}
            />
          </div>
          <div className="space-y-6">
            {TIMELINE.map((item, i) => (
              <div className="timeline-item relative flex gap-4 pl-0 opacity-0" key={item.year}>
                <div
                  className={cn(
                    "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-cinema-card-bg",
                    isDark ? "border-cinema-bg-alt" : "border-cinema-bg-alt",
                  )}
                >
                  {i === 0 && <span className="size-2 rounded-full bg-[#EF2CC1]" />}
                </div>
                <div className="flex-1 rounded-xl border border-cinema-card-border bg-cinema-card-bg p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-cinema-text-muted">
                      {item.year}
                    </span>
                    <span className="rounded-full border border-cinema-border bg-cinema-bg-alt px-2 py-0.5 font-mono text-[9px] uppercase text-cinema-text-muted">
                      {item.event}
                    </span>
                  </div>
                  <p
                    className="mt-2 text-lg font-medium text-cinema-text"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {item.salary}
                  </p>
                  {item.delta && (
                    <p className="mt-1 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                      {item.delta}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompensationStory;
