import type { Metadata } from "next";
import type { FC } from "react";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "About · PayLens",
  description: "What PayLens is and who it serves.",
};

const AboutPage: FC = () => {
  return (
    <PublicLayout>
      <main className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-8">
        <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
          About
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-medium tracking-tight">
          Built for the HR manager who owns the numbers.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-body">
          PayLens replaces spreadsheet-driven salary administration with a secure, auditable web
          application. HR teams keep one directory, one compensation history, and one set of
          analytics they can defend.
        </p>
      </main>
    </PublicLayout>
  );
};

export default AboutPage;
