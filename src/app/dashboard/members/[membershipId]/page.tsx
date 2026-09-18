"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { useMe } from "@/hooks/useAuth";
import { fetchMember, organizationKeys } from "@/services/organization.service";
import dayjs from "dayjs";

const MemberProfilePage: FC = () => {
  const { membershipId } = useParams<{ membershipId: string }>();
  const { data: session } = useMe();
  const member = useQuery({
    enabled: Boolean(membershipId),
    queryFn: () => fetchMember(membershipId),
    queryKey: organizationKeys.member(session?.activeOrganization?.id, membershipId),
  });

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-body underline-offset-4 hover:text-ink hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        href="/dashboard/members"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Organization members
      </Link>

      {member.isPending && (
        <div aria-label="Loading member" className="space-y-4">
          <div className="h-10 w-56 animate-pulse rounded-sm bg-surface-subtle" />
          <div className="h-64 animate-pulse rounded-sm border border-hairline bg-surface" />
        </div>
      )}

      {member.isError && (
        <Card variant="soft">
          <Card.Content>
            <h1 className="text-xl font-medium tracking-tight">Member not found</h1>
            <p className="mt-2 text-sm text-body">
              This member is unavailable in your active organization.
            </p>
            <Link
              className="mt-5 inline-flex min-h-10 items-center rounded-sm border border-hairline px-4 text-sm font-medium text-ink hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              href="/dashboard/members"
            >
              Return to organization members
            </Link>
          </Card.Content>
        </Card>
      )}

      {member.data && (
        <>
          <DashboardPageHeader
            eyebrow="Member"
            title={`${member.data.firstName} ${member.data.lastName}`}
          />
          <Card>
            <Card.Content>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar
                  alt={member.data.email}
                  fallback={`${member.data.firstName}${member.data.lastName}`}
                  size="lg"
                />
                <div>
                  <p className="text-lg font-medium">
                    {member.data.firstName} {member.data.lastName}
                  </p>
                  <p className="text-sm text-body">{member.data.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <Badge variant={member.data.status === "ACTIVE" ? "success" : "info"}>
                    {member.data.status}
                  </Badge>
                  <Badge variant="info">{member.data.role.replaceAll("_", " ")}</Badge>
                </div>
              </div>
            </Card.Content>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <Card.Header>
                <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
                  Account
                </p>
              </Card.Header>
              <Card.Content>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Name</dt>
                    <dd>
                      {member.data.firstName} {member.data.lastName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Email</dt>
                    <dd>{member.data.email}</dd>
                  </div>
                </dl>
              </Card.Content>
            </Card>
            <Card>
              <Card.Header>
                <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
                  Organization access
                </p>
              </Card.Header>
              <Card.Content>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Organization</dt>
                    <dd>{session?.activeOrganization?.name ?? "Active organization"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Role</dt>
                    <dd>{member.data.role.replaceAll("_", " ")}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Membership status</dt>
                    <dd>{member.data.status}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Joined</dt>
                    <dd>{dayjs(member.data.createdAt).format("DD MMM YYYY")}</dd>
                  </div>
                </dl>
              </Card.Content>
            </Card>
          </div>
        </>
      )}
    </section>
  );
};

export default MemberProfilePage;
