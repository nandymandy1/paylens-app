"use client";

import { useEffect, useRef, type FC } from "react";
import useThemeStore from "@/stores/theme";
import cn from "@/utils/cn";

const HeroProductScene: FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const cards = sceneRef.current?.querySelectorAll(".hero-card");

      if (!cards?.length) return;

      gsap.set(cards, { opacity: 0, y: 20 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.6,
      });
    };

    loadGSAP();
  }, []);

  return (
    <div ref={sceneRef} aria-hidden="true" className="relative mx-auto w-full max-w-[440px]">
      {/* Background glow */}
      <div
        className={cn(
          "absolute -inset-12 rounded-full blur-2xl",
          isDark
            ? "bg-[radial-gradient(ellipse,rgba(239,44,193,0.15)_0%,rgba(52,85,255,0.1)_40%,transparent_70%)]"
            : "bg-[radial-gradient(ellipse,rgba(239,44,193,0.1)_0%,rgba(52,85,255,0.07)_40%,transparent_70%)]",
        )}
      />

      {/* Compensation card */}
      <div className="hero-card relative rounded-xl border border-cinema-card-border bg-cinema-card-bg p-5 shadow-cinema-card backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-cinema-text-muted">
            Current compensation
          </span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[9px] font-medium text-emerald-600 uppercase dark:text-emerald-400">
            Active
          </span>
        </div>
        <p
          className="text-3xl font-semibold tracking-tight text-cinema-text"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          INR 34,00,000
        </p>
        <p className="mt-1 text-xs text-cinema-text-muted">Effective 12 May 2025</p>

        {/* Mini gradient accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl bg-[linear-gradient(90deg,#FC4C02_0%,#EF2CC1_35%,#BDBBFF_65%,#C8F6F9_100%)]" />
      </div>

      {/* Timeline trail */}
      <div className="hero-card ml-10 mt-4 w-[calc(100%-2.5rem)] rounded-xl border border-cinema-card-border bg-cinema-card-bg p-4 shadow-cinema-card backdrop-blur-lg">
        <div className="space-y-3">
          {[
            { year: "2026", label: "Annual Review", delta: "+14.8%" },
            { year: "2025", label: "Promotion", delta: "+11.2%" },
            { year: "2024", label: "Initial", delta: null },
          ].map((item) => (
            <div className="flex items-center gap-3" key={item.year}>
              <span className="flex size-2 shrink-0 items-center justify-center rounded-full bg-[#EF2CC1]" />
              <span className="font-mono text-[10px] text-cinema-text-muted">{item.year}</span>
              <span className="text-xs text-cinema-text-secondary">{item.label}</span>
              {item.delta && (
                <span className="ml-auto font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  {item.delta}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Workforce context card */}
      <div className="hero-card ml-6 mt-3 w-[calc(100%-1.5rem)] rounded-xl border border-cinema-card-border bg-cinema-card-bg/80 p-4 shadow-cinema-card backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#BDBBFF]/15 text-[10px] font-medium text-[#BDBBFF]">
            PA
          </div>
          <div>
            <p className="text-xs font-medium text-cinema-text">Purnima Abbott</p>
            <p className="text-[10px] text-cinema-text-muted">Marketing · Senior Specialist · L3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroProductScene;
