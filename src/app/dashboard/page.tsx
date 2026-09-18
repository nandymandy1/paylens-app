"use client";

import type { FC } from "react";
import PayLensLogo from "@/components/brand/PayLensLogo";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import Card from "@/components/ui/Card";
import { useMe } from "@/hooks/useAuth";

const DashboardPage: FC = () => {
  const { data } = useMe();

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <DashboardPageHeader
        description="Your compensation intelligence workspace is ready. Employee and compensation data will appear here as your organization is configured."
        eyebrow="Workspace"
        title={`Welcome${data ? `, ${data.user.firstName}` : ""}`}
      />
      <Card variant="highlight">
        <Card.Content className="flex flex-col gap-8 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] font-medium tracking-[0.09em] text-body uppercase">
              PayLens workspace
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight">
              See the bigger picture in pay.
            </h2>
            <p className="mt-3 text-sm leading-6 text-body">
              Set up your organization, invite the right people, and let the product data arrive
              when your workforce is configured.
            </p>
          </div>
          <PayLensLogo aria-hidden="true" className="opacity-90" size="lg" variant="mark" />
        </Card.Content>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          description="Your active PayLens workspace."
          label="Organization"
          value={data?.activeOrganization?.name ?? "—"}
        />
        <MetricCard
          description={`Email ${data?.user.emailVerified ? "verified" : "unverified"}.`}
          label="Account"
          value={data?.user.email ?? "—"}
        />
      </div>
    </section>
  );
};

export default DashboardPage;
