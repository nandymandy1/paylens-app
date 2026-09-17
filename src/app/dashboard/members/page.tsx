"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import InputEmail from "@/components/ui/InputEmail";
import { ApiError } from "@/services/api";
import {
  changeMemberRole,
  fetchInvitations,
  fetchMembers,
  inviteMember,
  organizationKeys,
  revokeInvitation,
} from "@/services/organization.service";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  role: z.enum(["HR_ADMIN", "HR_MANAGER", "MANAGER", "EMPLOYEE", "VIEWER_AUDITOR"]),
});

type InviteInput = z.infer<typeof inviteSchema>;

const ROLE_OPTIONS = ["HR_ADMIN", "HR_MANAGER", "MANAGER", "EMPLOYEE", "VIEWER_AUDITOR"] as const;

const MembersPage: FC = () => {
  const queryClient = useQueryClient();
  const [inviteError, setInviteError] = useState<string | null>(null);
  const members = useQuery({ queryKey: organizationKeys.members(), queryFn: fetchMembers });
  const invitations = useQuery({
    queryKey: organizationKeys.invitations(),
    queryFn: fetchInvitations,
  });
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<InviteInput>({ resolver: zodResolver(inviteSchema) });

  const invite = useMutation({
    mutationFn: (input: InviteInput) => inviteMember(input.email, input.role),
    onError: (error) => {
      setInviteError(
        error instanceof ApiError && error.code === "INSUFFICIENT_PERMISSION"
          ? "Your role cannot invite this role."
          : "Invitation failed. Try again.",
      );
    },
    onSuccess: async () => {
      setInviteError(null);
      reset();
      await queryClient.invalidateQueries({ queryKey: organizationKeys.invitations() });
    },
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeInvitation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.invitations() });
    },
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => changeMemberRole(id, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.members() });
    },
  });

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
          Members
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">Organization members</h1>
      </div>

      <Card>
        <Card.Header>
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Invite member
          </p>
        </Card.Header>
        <Card.Content>
          <form
            className="grid gap-4 sm:grid-cols-[1fr_12rem_auto]"
            noValidate
            onSubmit={handleSubmit((values) => invite.mutate(values))}
          >
            <FormField error={errors.email?.message} id="invite-email" label="Email" required>
              <InputEmail
                id="invite-email"
                placeholder="teammate@company.com"
                {...register("email")}
              />
            </FormField>
            <FormField error={errors.role?.message} id="invite-role" label="Role" required>
              <select
                className="min-h-10 w-full rounded-sm border border-hairline bg-surface px-3 text-sm"
                id="invite-role"
                {...register("role")}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex items-end">
              <Button loading={invite.isPending} type="submit">
                Invite
              </Button>
            </div>
          </form>
          {inviteError && (
            <div className="mt-4">
              <Alert
                icon={<AlertCircle className="size-4" />}
                title="Invite failed"
                variant="danger"
              >
                {inviteError}
              </Alert>
            </div>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Active members
          </p>
        </Card.Header>
        <Card.Content>
          {members.isPending && <p className="text-sm text-body">Loading members.</p>}
          {members.data?.length === 0 && <p className="text-sm text-body">No members yet.</p>}
          <ul className="space-y-3">
            {members.data?.map((member) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-hairline p-4"
                key={member.id}
              >
                <div>
                  <p className="font-medium">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-sm text-body">{member.email}</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-[11px] tracking-[0.05em] text-body uppercase">
                    Role
                  </span>
                  <select
                    aria-label={`Role for ${member.email}`}
                    className="min-h-9 rounded-sm border border-hairline bg-surface px-2 text-sm"
                    defaultValue={member.role}
                    onChange={(event) =>
                      changeRole.mutate({ id: member.id, role: event.target.value })
                    }
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Invitations
          </p>
        </Card.Header>
        <Card.Content>
          {invitations.isPending && <p className="text-sm text-body">Loading invitations.</p>}
          {invitations.data?.length === 0 && <p className="text-sm text-body">No invitations.</p>}
          <ul className="space-y-3">
            {invitations.data?.map((invitation) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-hairline p-4"
                key={invitation.id}
              >
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <p className="font-mono text-[11px] tracking-[0.05em] text-body uppercase">
                    {invitation.role}
                    {invitation.acceptedAt ? " · accepted" : ""}
                    {invitation.revokedAt ? " · revoked" : ""}
                  </p>
                </div>
                {!invitation.acceptedAt && !invitation.revokedAt && (
                  <Button
                    loading={revoke.isPending}
                    onClick={() => revoke.mutate(invitation.id)}
                    size="sm"
                    variant="outline"
                  >
                    Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card.Content>
      </Card>
    </section>
  );
};

export default MembersPage;
