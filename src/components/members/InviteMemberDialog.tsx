"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import InputEmail from "@/components/ui/InputEmail";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { ApiError } from "@/services/api";
import { inviteMember, organizationKeys } from "@/services/organization.service";
import { ORGANIZATION_ROLES, type OrganizationRole } from "@/types/organization.type";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  role: z.enum(ORGANIZATION_ROLES).exclude(["TENANT_OWNER"]),
});

type InviteInput = z.infer<typeof inviteSchema>;

type InviteMemberDialogProps = {
  inviteOptions: readonly OrganizationRole[];
};

const InviteMemberDialog: FC<InviteMemberDialogProps> = ({ inviteOptions }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    control,
    register,
    reset,
  } = useForm<InviteInput>({ resolver: zodResolver(inviteSchema) });

  const close = () => {
    setInviteError(null);
    reset();
    setOpen(false);
  };
  const invite = useMutation({
    mutationFn: (input: InviteInput) => inviteMember(input.email, input.role),
    onError: (error) => {
      const message =
        error instanceof ApiError && error.code === "INSUFFICIENT_PERMISSION"
          ? "Your role cannot invite this role."
          : "Invitation failed. Try again.";

      setInviteError(message);
      toast.error("Could not send invitation", { description: message });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.invitations() });
      toast.success("Invitation sent");
      close();
    },
  });

  return (
    <Modal
      description="Invite someone to your PayLens organization."
      footer={
        <>
          <Button onClick={close} variant="outline">
            Cancel
          </Button>
          <Button form="invite-member-form" loading={invite.isPending} type="submit">
            Invite member
          </Button>
        </>
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
        else setOpen(true);
      }}
      open={open}
      title="Invite member"
      trigger={
        <Button prefixIcon={<UserPlus aria-hidden="true" className="size-4" />}>
          Invite member
        </Button>
      }
    >
      <form
        className="grid gap-4"
        id="invite-member-form"
        noValidate
        onSubmit={handleSubmit((values) => invite.mutate(values))}
      >
        <FormField error={errors.email?.message} id="invite-email" label="Work email" required>
          <InputEmail id="invite-email" placeholder="teammate@company.com" {...register("email")} />
        </FormField>
        <FormField error={errors.role?.message} id="invite-role" label="Role" required>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                aria-label="Role"
                id="invite-role"
                invalid={Boolean(errors.role)}
                onChange={field.onChange}
                options={inviteOptions.map((role) => ({
                  title: role.replaceAll("_", " "),
                  value: role,
                }))}
                placeholder="Select role"
                value={field.value}
              />
            )}
          />
        </FormField>
        {inviteError && (
          <Alert icon={<AlertCircle className="size-4" />} title="Invite failed" variant="danger">
            {inviteError}
          </Alert>
        )}
      </form>
    </Modal>
  );
};

export default InviteMemberDialog;
