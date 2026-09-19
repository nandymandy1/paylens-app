"use client";

import Link from "next/link";
import type { FC } from "react";
import ScrollReveal from "./ScrollReveal";
import BrandRibbon from "./BrandRibbon";
import DataGrid from "./DataGrid";
import useThemeStore from "@/stores/theme";
import { AUTH_ROUTES } from "@/utils/routes";
import cn from "@/utils/cn";

const FinalCTA: FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <section className="relative overflow-hidden bg-cinema-bg py-28 text-cinema-text">
      <DataGrid className="pointer-events-none absolute inset-0 z-0 text-cinema-border/20" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8">
        <ScrollReveal>
          <div className="relative rounded-2xl border border-cinema-card-border bg-cinema-card-bg p-10 text-center backdrop-blur-xl sm:p-16">
            {/* Brand gradient rim */}
            <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-[linear-gradient(90deg,#FC4C02_0%,#EF2CC1_35%,#BDBBFF_65%,#C8F6F9_100%)]" />

            <p className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-cinema-hero-eyebrow">
              Start with clarity
            </p>
            <h2 className="mt-4 text-[clamp(1.6rem,3.5vw,2.5rem)] leading-tight tracking-[-0.03em] font-medium text-cinema-hero-text">
              Build a clearer compensation picture.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-cinema-hero-subtext">
              Set up your organization, connect your workforce, and see compensation with the
              clarity it deserves.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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
                    : "border-cinema-border bg-cinema-bg-alt text-cinema-text-secondary hover:border-cinema-border-strong hover:bg-cinema-card-bg hover:text-cinema-text",
                )}
                href={AUTH_ROUTES.login}
              >
                Sign in
              </Link>
            </div>

            {/* Decorative ribbon */}
            <div className="pointer-events-none absolute -right-20 -bottom-20 opacity-20">
              <BrandRibbon className="w-[400px] rotate-12" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FinalCTA;
