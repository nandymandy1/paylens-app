import type { Metadata } from "next";
import Link from "next/link";
import type { FC } from "react";
import { BarChart3, Building2, ShieldCheck } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Compensation Intelligence",
  description: "Turn compensation data into clear decisions, fair growth, and stronger teams.",
};

const capabilities = [
  {
    icon: BarChart3,
    eyebrow: "Compensation",
    title: "A clearer view of pay",
    body: "Designed to keep current compensation and its historical context understandable.",
  },
  {
    icon: Building2,
    eyebrow: "Workforce",
    title: "Context across your organization",
    body: "Built to connect teams, roles, locations, and the decisions behind compensation.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Analytics",
    title: "Confidence in every decision",
    body: "Made for traceable information, deliberate access, and more equitable growth.",
  },
];

const HomePage: FC = () => (
  <PublicLayout>
    <main>
      <section className="overflow-hidden bg-canvas-dark text-on-dark">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-on-dark/65 uppercase">
              Compensation intelligence
            </p>
            <h1 className="mt-5 max-w-xl text-5xl leading-[.98] font-medium tracking-[-.05em] sm:text-7xl">
              See the bigger picture in pay.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-7 text-on-dark/70">
              Turn compensation data into clear decisions, fair growth, and stronger teams.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center rounded-sm bg-surface px-5 font-mono text-sm font-medium tracking-[.04em] text-ink uppercase hover:opacity-85"
                href="/register"
              >
                Get started
              </Link>
              <Link
                className="inline-flex min-h-11 items-center rounded-sm border border-surface-dark-soft px-5 font-mono text-sm font-medium tracking-[.04em] uppercase hover:bg-surface-dark-soft"
                href="/login"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center"
          >
            <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,#ef2cc155_0%,#3455ff20_42%,transparent_70%)] blur-2xl" />
            <Image
              alt=""
              className="relative w-[72%] drop-shadow-[0_24px_36px_rgba(239,44,193,.2)]"
              src="/brand/paylens-mark.svg"
            />
          </div>
        </div>
      </section>
      <section className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4 py-6 font-mono text-[11px] tracking-[.08em] text-body uppercase sm:px-8">
          <span>Built for compensation clarity</span>
          <span>Organization-aware</span>
          <span>Audit-minded</span>
          <span>Designed for growth</span>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8" id="product">
        <p className="font-mono text-[11px] tracking-[.08em] text-body uppercase">
          The PayLens approach
        </p>
        <h2 className="mt-4 max-w-2xl text-4xl leading-tight tracking-[-.04em] sm:text-5xl">
          Understand how your organization pays.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-body">
          PayLens is designed for the work that follows a compensation decision—not just the number
          itself.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {capabilities.map(({ body, eyebrow, icon: Icon, title }) => (
            <article className="rounded-sm border border-hairline bg-surface p-6" key={title}>
              <Icon className="size-5" />
              <p className="mt-8 font-mono text-[11px] tracking-[.07em] text-body uppercase">
                {eyebrow}
              </p>
              <h3 className="mt-3 text-2xl tracking-tight">{title}</h3>
              <p className="mt-3 leading-6 text-body">{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-canvas-soft py-20" id="how-it-works">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-8 md:grid-cols-[1fr_.9fr]">
          <div>
            <p className="font-mono text-[11px] tracking-[.08em] text-body uppercase">
              Designed for clarity
            </p>
            <h2 className="mt-4 text-4xl leading-tight tracking-[-.04em]">
              Compensation clarity, without spreadsheet chaos.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-7 text-body">
              Current pay, historical change, workforce context, and analysis belong in one
              deliberate system.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-sm bg-brand-periwinkle p-6">
              <p className="font-mono text-[11px] tracking-[.07em] uppercase">Pay history</p>
              <p className="mt-12 text-3xl tracking-tight">Traceable</p>
            </div>
            <div className="rounded-sm bg-accent-mint p-6">
              <p className="font-mono text-[11px] tracking-[.07em] uppercase">Data context</p>
              <p className="mt-12 text-3xl tracking-tight">Connected</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-canvas-dark py-20 text-on-dark" id="security">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <p className="font-mono text-[11px] tracking-[.08em] text-on-dark/60 uppercase">
            Trust by design
          </p>
          <h2 className="mt-4 max-w-2xl text-4xl leading-tight tracking-[-.04em]">
            Sensitive pay data deserves a clear, accountable home.
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-surface-dark-soft bg-surface-dark-soft md:grid-cols-3">
            <p className="bg-canvas-dark p-6 text-on-dark/70">Tenant-aware foundations</p>
            <p className="bg-canvas-dark p-6 text-on-dark/70">Auditable compensation history</p>
            <p className="bg-canvas-dark p-6 text-on-dark/70">Purposeful access controls</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <div className="flex flex-col justify-between gap-8 rounded-sm border border-hairline p-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[11px] tracking-[.08em] text-body uppercase">
              Start with clarity
            </p>
            <h2 className="mt-4 text-4xl tracking-[-.04em]">
              Build a clearer compensation picture.
            </h2>
          </div>
          <div className="flex gap-3">
            <Link
              className="inline-flex min-h-11 items-center rounded-sm bg-primary px-5 font-mono text-sm tracking-[.04em] text-on-primary uppercase"
              href="/register"
            >
              Get started
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-sm border border-hairline px-5 font-mono text-sm tracking-[.04em] uppercase"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  </PublicLayout>
);

export default HomePage;
