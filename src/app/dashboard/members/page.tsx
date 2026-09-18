"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import InviteMemberDialog from "@/components/members/InviteMemberDialog";
import InvitationsTable from "@/components/members/InvitationsTable";
import MembersTable from "@/components/members/MembersTable";
import Card from "@/components/ui/Card";
import { useMe } from "@/hooks/useAuth";
import useAuthSessionStore from "@/stores/auth-session";
import {
  changeMemberRole,
  fetchInvitations,
  fetchMembers,
  organizationKeys,
  revokeInvitation,
} from "@/services/organization.service";
import {
  INVITABLE_ROLES,
  MEMBER_ADMIN_ROLES,
  type MemberAdminRole,
  type OrganizationRole,
} from "@/types/organization.type";

const isMemberAdmin = (role: OrganizationRole | undefined): boolean =>
  role !== undefined && (MEMBER_ADMIN_ROLES as readonly OrganizationRole[]).includes(role);

const MembersPage: FC = () => {
  const queryClient = useQueryClient();
  const { data: session } = useMe();
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const organizationId = session?.activeOrganization?.id;
  const activeRole = session?.activeMembership?.role;
  const canAdminister = isMemberAdmin(activeRole);
  const inviteOptions =
    activeRole !== undefined &&
    (MEMBER_ADMIN_ROLES as readonly OrganizationRole[]).includes(activeRole)
      ? INVITABLE_ROLES[activeRole as MemberAdminRole]
      : [];
  const canMutateRoles = activeRole === "TENANT_OWNER";
  const members = useQuery({
    enabled: (sessionStatus === "authenticated" || sessionStatus === "unknown") && canAdminister,
    queryFn: fetchMembers,
    queryKey: organizationKeys.members(organizationId),
  });
  const invitations = useQuery({
    enabled: (sessionStatus === "authenticated" || sessionStatus === "unknown") && canAdminister,
    queryFn: fetchInvitations,
    queryKey: organizationKeys.invitations(organizationId),
  });
  const revoke = useMutation({
    mutationFn: revokeInvitation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.invitations(organizationId),
      });
    },
  });
  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: OrganizationRole }) =>
      changeMemberRole(id, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationId) });
    },
  });

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <DashboardPageHeader
        actions={canAdminister ? <InviteMemberDialog inviteOptions={inviteOptions} /> : undefined}
        description="Manage who can access PayLens and what they can do."
        eyebrow="Workforce"
        title="Organization members"
      />

      {!canAdminister && (
        <Card variant="soft">
          <Card.Content>
            <p className="text-sm text-body">
              Your role cannot manage organization members. Contact your workspace administrator.
            </p>
          </Card.Content>
        </Card>
      )}

      {canAdminister && (
        <section aria-labelledby="active-members-heading" className="space-y-3">
          <h2
            className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase"
            id="active-members-heading"
          >
            Active members
          </h2>
          <MembersTable
            canMutateRoles={canMutateRoles}
            isLoading={members.isPending}
            members={members.data}
            onRoleChange={(id, role) => changeRole.mutate({ id, role })}
            roleOptions={inviteOptions}
          />
        </section>
      )}

      {canAdminister && (
        <section aria-labelledby="invitations-heading" className="space-y-3">
          <h2
            className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase"
            id="invitations-heading"
          >
            Invitations
          </h2>
          <InvitationsTable
            invitations={invitations.data}
            isLoading={invitations.isPending}
            isRevoking={revoke.isPending}
            onRevoke={(id) => revoke.mutate(id)}
          />
        </section>
      )}
    </section>
  );
};

export default MembersPage;
