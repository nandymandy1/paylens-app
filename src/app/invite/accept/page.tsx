"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FC } from "react";
import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import AuthCard from "@/components/auth/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import Button from "@/components/ui/Button";
import { useMe } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import {
  acceptInvitationAuthenticated,
  acceptInvitationNewUser,
  authKeys,
  fetchMe,
  previewInvitation,
} from "@/services/auth.service";
import useAuthSessionStore from "@/stores/auth-session";
import { inviteAcceptNewUserSchema } from "@/types/auth.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import InputPassword from "@/components/ui/InputPassword";

const InviteAcceptContent: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const token = searchParams.get("token") ?? "";
  const { data: session } = useMe();
  const preview = useQuery({
    queryKey: authKeys.invitationPreview(token),
    queryFn: () => previewInvitation(token),
    enabled: token.length > 0,
    retry: false,
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm({
    resolver: zodResolver(inviteAcceptNewUserSchema),
    defaultValues: { token },
  });

  if (!token) {
    return (
      <AuthCard
        description="This invitation link is missing its token."
        eyebrow="Invalid link"
        title="Link incomplete"
      >
        <Link className="text-sm underline underline-offset-4" href="/login">
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  if (preview.isPending) {
    return (
      <AuthCard description="Loading invitation details." eyebrow="Invitation" title="One moment">
        <p className="font-mono text-xs tracking-[0.05em] text-body uppercase">Loading</p>
      </AuthCard>
    );
  }

  if (preview.isError) {
    const code = preview.error instanceof ApiError ? preview.error.code : "INVITATION_INVALID";

    return (
      <AuthCard
        description={
          code === "INVITATION_EXPIRED"
            ? "This invitation has expired. Ask your administrator for a new one."
            : code === "INVITATION_REVOKED"
              ? "This invitation was revoked. Ask your administrator for a new one."
              : "This invitation link is invalid or already used."
        }
        eyebrow="Invitation"
        title="Cannot preview invitation"
      >
        <Link className="text-sm underline underline-offset-4" href="/login">
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  const invitation = preview.data;
  const sessionEmail = session?.user.email?.toLowerCase() ?? null;
  const matchesSession = sessionEmail === invitation.email.toLowerCase();

  const reconcileSession = async (preserveAuthenticated: boolean) => {
    // New-user acceptance creates a browser session: anonymous must become
    // authenticated with canonical auth/me before dashboard renders.
    // Authenticated acceptance keeps the live session and refreshes memberships.
    if (!preserveAuthenticated) {
      useAuthSessionStore.getState().markAuthenticated();
    }

    try {
      const me = await queryClient.fetchQuery({ queryKey: authKeys.me(), queryFn: fetchMe });

      queryClient.setQueryData(authKeys.me(), me);
    } catch {
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    }

    await queryClient.invalidateQueries({ queryKey: ["organizations"] });
  };

  const acceptExisting = async () => {
    try {
      await acceptInvitationAuthenticated(token);
      await reconcileSession(true);
      router.push("/dashboard");
    } catch (error) {
      setError("root", {
        message:
          error instanceof ApiError && error.code === "INVITATION_EMAIL_MISMATCH"
            ? "You are signed in with a different email. Switch accounts to accept."
            : "Accepting failed. Try again.",
      });
    }
  };

  return (
    <AuthCard
      description={`You are invited to join ${invitation.organization.name} as ${invitation.role}.`}
      eyebrow="Invitation"
      title={invitation.organization.name}
    >
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-body">Invited email</dt>
          <dd className="font-medium">{invitation.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-body">Role</dt>
          <dd className="font-medium">{invitation.role}</dd>
        </div>
      </dl>

      {session && !matchesSession && (
        <div className="mt-4">
          <Alert icon={<AlertCircle className="size-4" />} title="Email mismatch" variant="danger">
            You are signed in as {session.user.email}. Sign out and continue with {invitation.email}
            , or register below with the invited email.
          </Alert>
          <div className="mt-4 flex gap-3">
            <Link className="text-sm underline underline-offset-4" href="/login">
              Switch account
            </Link>
          </div>
        </div>
      )}

      {session && matchesSession && (
        <div className="mt-6">
          <Button block onClick={acceptExisting} type="button">
            Accept invitation
          </Button>
        </div>
      )}

      {!session && (
        <>
          <form
            className="mt-6 space-y-4"
            noValidate
            onSubmit={handleSubmit(async (values) => {
              try {
                await acceptInvitationNewUser(values);
                await reconcileSession(false);
                router.push("/dashboard");
              } catch (error) {
                setError("root", {
                  message:
                    error instanceof ApiError && error.code === "INVITATION_LOGIN_REQUIRED"
                      ? "An account with this email already exists. Sign in to accept."
                      : "Accepting failed. Try again.",
                });
              }
            })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                error={errors.firstName?.message}
                id="firstName"
                label="First name"
                required
              >
                <Input
                  placeholder="First Name"
                  autoComplete="given-name"
                  id="firstName"
                  {...register("firstName")}
                />
              </FormField>
              <FormField error={errors.lastName?.message} id="lastName" label="Last name" required>
                <Input
                  placeholder="Last Name"
                  autoComplete="family-name"
                  id="lastName"
                  {...register("lastName")}
                />
              </FormField>
            </div>
            <FormField
              error={errors.password?.message}
              helpText="At least 12 characters."
              id="password"
              label="Password"
              required
            >
              <InputPassword
                placeholder="Password"
                autoComplete="new-password"
                id="password"
                {...register("password")}
              />
            </FormField>
            <FormField
              error={errors.confirmPassword?.message}
              id="confirmPassword"
              label="Confirm password"
              required
            >
              <InputPassword
                placeholder="Confirm Password"
                autoComplete="new-password"
                id="confirmPassword"
                {...register("confirmPassword")}
              />
            </FormField>
            {errors.root?.message && (
              <Alert
                icon={<AlertCircle className="size-4" />}
                title="Cannot accept"
                variant="danger"
              >
                {errors.root.message}
              </Alert>
            )}
            <Button block type="submit">
              Create account and join
            </Button>
          </form>
          <div className="mt-4">
            <GoogleButton invitationId={invitation.id} label="Continue with Google" />
          </div>
          <p className="mt-4 text-sm text-body">
            Already have an account?{" "}
            <Link
              className="underline underline-offset-4"
              href={`/login?redirect_to=${encodeURIComponent(`/invite/accept?token=${token}`)}`}
            >
              Sign in to accept
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  );
};

const InviteAcceptPage: FC = () => {
  return (
    <Suspense>
      <InviteAcceptContent />
    </Suspense>
  );
};

export default InviteAcceptPage;
