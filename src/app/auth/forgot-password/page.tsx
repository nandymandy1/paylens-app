"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";
import Alert from "@/components/ui/Alert";
import AuthCard from "@/components/auth/AuthCard";
import { RequireAnonymous } from "@/components/auth/AuthGuards";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import InputEmail from "@/components/ui/InputEmail";
import { useForgotPassword } from "@/hooks/useAuth";
import { AUTH_ROUTES } from "@/utils/routes";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/types/auth.type";

const ForgotPasswordPage: FC = () => {
  const forgot = useForgotPassword();
  const [sent, setSent] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  if (sent) {
    return (
      <AuthCard
        description="If an eligible account exists, a password reset email has been sent."
        eyebrow="Check your inbox"
        title="Reset requested"
        variant="forgot"
      >
        <Alert icon={<MailCheck className="size-4" />} title="Next step" variant="success">
          The link expires in 30 minutes. You can close this page.
        </Alert>
        <p className="mt-6 text-sm text-body">
          <Link className="underline underline-offset-4" href={AUTH_ROUTES.login}>
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <RequireAnonymous>
      <AuthCard
        description="Enter your account email. The response is identical whether or not the account exists."
        eyebrow="Forgot password"
        title="Reset your password"
        variant="forgot"
      >
        <form
          className="mt-6 space-y-4"
          noValidate
          onSubmit={handleSubmit((values) =>
            forgot.mutate(values, { onSuccess: () => setSent(true) }),
          )}
        >
          <FormField error={errors.email?.message} id="email" label="Account email" required>
            <InputEmail
              id="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register("email")}
            />
          </FormField>
          <Button block loading={forgot.isPending} type="submit">
            Send reset link
          </Button>
        </form>
        <p className="mt-6 text-sm text-body">
          <Link className="underline underline-offset-4" href={AUTH_ROUTES.login}>
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </RequireAnonymous>
  );
};

export default ForgotPasswordPage;
