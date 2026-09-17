import type { Metadata } from "next";
import type { FC } from "react";
import Alert from "@/components/ui/Alert";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "Terms of Service · PayLens",
  description: "Project demo terms for PayLens.",
};

const TermsPage: FC = () => {
  return (
    <PublicLayout>
      <main className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-8">
        <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
          Terms of service
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-medium tracking-tight">Project demo terms</h1>
        <div className="mt-6 max-w-2xl">
          <Alert title="Draft status" variant="info">
            This page describes demo-stage project terms, not binding legal commitments. Final legal
            terms will be supplied before any production use.
          </Alert>
        </div>
        <div className="mt-8 max-w-2xl space-y-4 leading-7 text-body">
          <p>
            PayLens is an internal HR demonstration product. Demo data is illustrative and must not
            be treated as real employee or compensation information.
          </p>
          <p>
            Accounts, organizations, and invitations created during evaluation exist only for review
            purposes and may be reset between demo stages.
          </p>
          <p>
            Authentication sessions are short-lived and revocable. Report any suspected misuse
            through the contact page.
          </p>
        </div>
      </main>
    </PublicLayout>
  );
};

export default TermsPage;
