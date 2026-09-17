import type { Metadata } from "next";
import Link from "next/link";
import type { FC } from "react";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "PayLens · Compensation operations",
  description: "Secure, auditable compensation operations for modern HR teams.",
};

const HomePage: FC = () => {
  return (
    <PublicLayout>
      <main className="bg-canvas text-ink">
        <section className="bg-canvas-dark text-on-dark">
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-20 sm:px-8 md:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.05em] uppercase">
                PayLens for HR teams
              </p>
              <h1 className="mt-4 text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
                Compensation operations, made clear.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-7 opacity-80">
                One auditable home for employee pay: directory, compensation history, and analytics
                your whole HR team can trust.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-10 items-center rounded-sm bg-primary px-4 font-mono text-sm font-medium tracking-[0.005em] text-on-primary uppercase hover:opacity-80"
                  href="/register"
                >
                  Get started
                </Link>
                <Link
                  className="inline-flex min-h-10 items-center rounded-sm border border-surface-dark-soft px-4 font-mono text-sm font-medium tracking-[0.005em] uppercase hover:opacity-80"
                  href="/about-us"
                >
                  Learn more
                </Link>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="rounded-sm p-[2px]"
              style={{ background: "linear-gradient(135deg,#fc4c02,#ef2cc1,#bdbbff)" }}
            >
              <div className="h-full min-h-56 rounded-sm bg-canvas-dark p-8">
                <p className="font-mono text-[11px] tracking-[0.05em] uppercase opacity-70">
                  Headcount · Pay bands · History
                </p>
                <p className="mt-4 text-2xl font-medium">Every number traces to its source.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-8">
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Why PayLens
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
            Salary administration without the spreadsheet risk.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Directory",
                body: "Find any employee fast with search, filters, and pagination built for scale.",
              },
              {
                title: "History",
                body: "Append-only compensation changes with effective dates, reasons, and audit.",
              },
              {
                title: "Analytics",
                body: "Headcount and pay distribution grouped safely by team, country, and role.",
              },
            ].map((feature) => (
              <article
                className="rounded-sm border border-hairline bg-surface p-6"
                key={feature.title}
              >
                <h3 className="text-xl font-medium">{feature.title}</h3>
                <p className="mt-2 leading-6 text-body">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
};

export default HomePage;
