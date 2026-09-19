"use client";

import Link from "next/link";
import { useEffect, useRef, type FC } from "react";
import HeroProductScene from "./HeroProductScene";
import AmbientGlow from "./AmbientGlow";
import DataGrid from "./DataGrid";
import BrandRibbon from "./BrandRibbon";
import useThemeStore from "@/stores/theme";
import { AUTH_ROUTES } from "@/utils/routes";
import cn from "@/utils/cn";

const HeroSection: FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const el = sectionRef.current;

      if (!el) return;

      const eyebrow = el.querySelector(".hero-eyebrow");
      const headline = el.querySelector(".hero-headline");
      const copy = el.querySelector(".hero-copy");
      const ctas = el.querySelector(".hero-ctas");

      gsap.set([eyebrow, headline, copy, ctas], { opacity: 0, y: 16 });
      gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.1 });
      gsap.to(headline, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.2 });
      gsap.to(copy, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.4 });
      gsap.to(ctas, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.55 });
    };

    loadGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="landing-hero relative overflow-hidden bg-cinema-bg text-cinema-text"
    >
      <AmbientGlow variant="hero" className="z-0" />
      <DataGrid className="pointer-events-none absolute inset-0 z-0 text-cinema-border/20" />

      {/* Large background logo fragment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/2 z-0 w-[500px] -translate-y-1/2 opacity-[var(--cinema-hero-mark-opacity)]"
      >
        <svg viewBox="0 0 96 112" fill="none">
          <defs>
            <linearGradient id="hero-mark-grad" x1="0" y1="0" x2="96" y2="112">
              <stop offset="0%" stopColor="#FC4C02" />
              <stop offset="40%" stopColor="#EF2CC1" />
              <stop offset="70%" stopColor="#BDBBFF" />
              <stop offset="100%" stopColor="#3455FF" />
            </linearGradient>
          </defs>
          <path
            d="M48 0 C20 0 0 16 0 40 C0 68 22 88 48 112 C74 88 96 68 96 40 C96 16 76 0 48 0Z"
            fill="url(#hero-mark-grad)"
          />
          <path
            d="M30 45 L66 45 L66 35 L46 35 L46 25 L70 25 L70 15 L30 15Z"
            fill="url(#hero-mark-grad)"
          />
          <path d="M30 75 L42 75 L42 65 L30 65Z" fill="url(#hero-mark-grad)" />
          <path d="M50 75 L70 75 L70 65 L50 65Z" fill="url(#hero-mark-grad)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-36 pb-20 sm:px-8 md:grid-cols-[1fr_1.1fr] md:pt-44 md:pb-28">
        <div>
          <p className="hero-eyebrow font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-cinema-hero-eyebrow">
            Compensation intelligence
          </p>
          <h1 className="hero-headline mt-5 max-w-xl text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.04em]">
            See the bigger
            <br />
            picture in pay.
          </h1>
          <p className="hero-copy mt-6 max-w-md text-base leading-7 text-cinema-hero-subtext">
            Turn compensation data into clear decisions, fair growth, and stronger teams.
          </p>
          <div className="hero-ctas mt-9 flex flex-wrap gap-3">
            <Link
              className={cn(
                "landing-cta-primary inline-flex min-h-12 items-center rounded-md px-6 font-mono text-sm font-medium tracking-[0.04em] uppercase transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5",
                isDark
                  ? "bg-white text-[#06061a] hover:shadow-[0_6px_24px_rgb(239,44,193,0.3)]"
                  : "bg-[#11111d] text-white hover:shadow-[0_6px_24px_rgb(239,44,193,0.2)]",
              )}
              href={AUTH_ROUTES.register}
            >
              Get started
            </Link>
            <Link
              className={cn(
                "inline-flex min-h-12 items-center rounded-md border px-6 font-mono text-sm font-medium tracking-[0.04em] uppercase backdrop-blur-sm transition-[border-color,background-color,color] duration-200",
                isDark
                  ? "border-white/15 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
                  : "border-cinema-border bg-white/60 text-cinema-text-secondary hover:border-cinema-border-strong hover:bg-white hover:text-cinema-text",
              )}
              href={AUTH_ROUTES.login}
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <HeroProductScene />
        </div>
      </div>

      {/* Brand ribbon at bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <BrandRibbon className="w-full opacity-40" />
      </div>
    </section>
  );
};

export default HeroSection;
