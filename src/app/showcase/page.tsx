import type { FC } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ActionsSection from "@/components/showcase/ActionsSection";
import DataDisplaySection from "@/components/showcase/DataDisplaySection";
import DateSelectionSection from "@/components/showcase/DateSelectionSection";
import FeedbackSection from "@/components/showcase/FeedbackSection";
import FormControlsSection from "@/components/showcase/FormControlsSection";
import FoundationsSection from "@/components/showcase/FoundationsSection";
import InteractionSection from "@/components/showcase/InteractionSection";
import OverlaySection from "@/components/showcase/OverlaySection";
import PayLensLogo from "@/components/brand/PayLensLogo";

export const metadata: Metadata = {
  title: "Design System",
  description: "PayLens design tokens, themes, and reusable UI primitives.",
};

const ComponentsPage: FC = () => {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <header className="bg-canvas-dark px-4 py-16 text-on-dark sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-16">
            <Link
              href="/"
              className="font-mono text-[11px] font-medium tracking-[0.05em] text-on-dark/70 uppercase underline-offset-4 hover:text-on-dark hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-periwinkle"
            >
              PayLens / System
            </Link>
          </nav>
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-on-dark/65 uppercase">
            H4 / Date and selection
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.05] font-medium tracking-[-0.03em] sm:text-7xl">
            PayLens Design System
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-7 text-on-dark/70">
            The production foundation for clear, secure compensation workflows. Every example below
            is a shared component used exactly as feature code will use it.
          </p>
          <div className="mt-10 h-1 w-44 rounded-sm bg-[linear-gradient(90deg,#fc4c02,#ef2cc1,#bdbbff)]" />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <section className="border-b border-hairline py-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Brand identity
          </p>
          <h2 className="mt-3 text-3xl tracking-tight">PayLens visual system</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-hairline p-6">
              <PayLensLogo size="lg" />
              <p className="mt-6 font-mono text-[10px] tracking-[.06em] text-body uppercase">
                Full / light
              </p>
            </div>
            <div className="bg-canvas-dark p-6">
              <PayLensLogo size="lg" theme="dark" />
              <p className="mt-6 font-mono text-[10px] tracking-[.06em] text-on-dark/60 uppercase">
                Full / dark
              </p>
            </div>
            <div className="border border-hairline p-6">
              <PayLensLogo size="lg" variant="compact" />
              <p className="mt-6 font-mono text-[10px] tracking-[.06em] text-body uppercase">
                Compact
              </p>
            </div>
            <div className="border border-hairline p-6">
              <PayLensLogo size="lg" variant="mark" />
              <p className="mt-6 font-mono text-[10px] tracking-[.06em] text-body uppercase">
                Mark / favicon
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {["#FC4C02", "#EF2CC1", "#BDBBFF", "#3455FF", "#010120", "#000000", "#FFFFFF"].map(
              (color) => (
                <span
                  className="flex items-center gap-2 border border-hairline px-3 py-2 font-mono text-[10px] tracking-[.05em]"
                  key={color}
                >
                  <i
                    className="size-4 rounded-sm border border-hairline"
                    style={{ backgroundColor: color }}
                  />
                  {color}
                </span>
              ),
            )}
          </div>
        </section>
        <FoundationsSection />
        <ActionsSection />
        <DataDisplaySection />
        <FeedbackSection />
        <OverlaySection />
        <FormControlsSection />
        <InteractionSection />
        <DateSelectionSection />
      </div>
      <footer className="overflow-hidden border-t border-hairline px-4 pt-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Design system V1 complete / H4
          </p>
          <p className="mt-8 translate-y-[0.13em] text-[clamp(4rem,15vw,12rem)] leading-none font-medium tracking-[-0.06em] text-surface-subtle select-none">
            paylens
          </p>
        </div>
      </footer>
    </main>
  );
};

export default ComponentsPage;
