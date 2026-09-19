"use client";

import Link from "next/link";
import type { FC } from "react";
import { Building2, Users, UsersRound } from "lucide-react";
import PayLensLogo from "@/components/brand/PayLensLogo";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import Card from "@/components/ui/Card";
import { useMe } from "@/hooks/useAuth";

const QUICK_LINKS = [
  {
    href: "/dashboard/employees",
    label: "Employees",
    description: "Browse your workforce directory.",
    icon: UsersRound,
  },
  {
    href: "/dashboard/departments",
    label: "Departments",
    description: "Organize teams and structure.",
    icon: Building2,
  },
  {
    href: "/dashboard/members",
    label: "Members",
    description: "Manage workspace access.",
    icon: Users,
  },
] as const;

const DashboardPage: FC = () => {
  const { data } = useMe();

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <DashboardPageHeader
        description="Your compensation intelligence workspace is ready. Employee and compensation data will appear here as your organization is configured."
        eyebrow="Workspace"
        title={`Welcome, ${data?.user.firstName ?? "..."}`}
      />
      <Card variant="highlight">
        <Card.Content className="relative overflow-hidden p-6 sm:p-8">
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              <h2 className="text-xl font-medium tracking-tight text-ink sm:text-2xl">
                Your compensation intelligence workspace
              </h2>
              <p className="mt-2.5 text-sm leading-6 text-body">
                Set up your organization, invite the right people, and let the product data arrive
                when your workforce is configured.
              </p>
            </div>
            <PayLensLogo
              aria-hidden="true"
              className="shrink-0 opacity-80"
              size="lg"
              variant="mark"
            />
          </div>
          {/* Decorative gradient orb */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-[0.07]"
            style={{
              background:
                "radial-gradient(circle, var(--brand-magenta) 0%, var(--brand-blue) 50%, transparent 70%)",
            }}
          />
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
      <div>
        <h2 className="mb-3 font-mono text-[10px] font-medium tracking-[0.08em] text-body/60 uppercase">
          Quick navigation
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-start gap-3 rounded-md border border-hairline bg-surface p-4 text-left transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-px hover:border-ink/15 hover:shadow-elevated"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-canvas-soft text-body transition-colors duration-150 group-hover:bg-canvas group-hover:text-ink">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{link.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-body">
                    {link.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
