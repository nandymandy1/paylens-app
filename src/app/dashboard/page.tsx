"use client";

import type { FC } from "react";
import Card from "@/components/ui/Card";
import { useMe } from "@/hooks/useAuth";

const DashboardPage: FC = () => {
  const { data } = useMe();

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">
          Welcome{data ? `, ${data.user.firstName}` : ""}
        </h1>
        <p className="mt-2 text-base leading-6 text-body">
          {data?.activeOrganization
            ? `You are working in ${data.activeOrganization.name} as ${data.activeMembership?.role}.`
            : "Your workspace is ready."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <Card.Header>
            <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
              Organization
            </p>
          </Card.Header>
          <Card.Content>
            <p className="text-lg font-medium">{data?.activeOrganization?.name ?? "—"}</p>
            <p className="mt-1 text-sm text-body">Memberships: {data?.memberships.length ?? 0}</p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
              Account
            </p>
          </Card.Header>
          <Card.Content>
            <p className="text-lg font-medium">{data?.user.email ?? "—"}</p>
            <p className="mt-1 text-sm text-body">
              Email {data?.user.emailVerified ? "verified" : "unverified"}
            </p>
          </Card.Content>
        </Card>
      </div>
    </section>
  );
};

export default DashboardPage;
