"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FC } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import AuthCard from "@/components/auth/AuthCard";
import { RequireAnonymous } from "@/components/auth/AuthGuards";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import InputPassword from "@/components/ui/InputPassword";
import { useResetPassword } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { AUTH_ROUTES } from "@/utils/routes";
import { resetPasswordSchema } from "@/types/auth.type";

const ResetPasswordForm: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const reset = useResetPassword();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { token } });

  if (!token) {
    return (
      <AuthCard
        description="This reset link is missing its token. Request a new one."
        eyebrow="Invalid link"
        title="Link incomplete"
        variant="reset"
      >
        <Link className="text-sm underline underline-offset-4" href={AUTH_ROUTES.forgotPassword}>
          Request another reset
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      description="Choose a new password for your account."
      eyebrow="Reset password"
      title="New password"
      variant="reset"
    >
      <form
        className="mt-6 space-y-4"
        noValidate
        onSubmit={handleSubmit((values) =>
          reset.mutate(values, {
            onError: (error) => {
              if (error instanceof ApiError && error.code === "PASSWORD_RESET_TOKEN_EXPIRED") {
                setError("root", { message: "This link has expired. Request another reset." });
              } else if (error instanceof ApiError) {
                setError("root", { message: "This link is invalid or already used." });
              } else {
                setError("root", { message: "Reset failed. Try again." });
              }
            },
            onSuccess: () => {
              router.push(`${AUTH_ROUTES.login}?password_reset=success`);
            },
          }),
        )}
      >
        <FormField
          error={errors.password?.message}
          helpText="At least 12 characters."
          id="password"
          label="New password"
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
          <Alert icon={<AlertCircle className="size-4" />} title="Reset failed" variant="danger">
            {errors.root.message}{" "}
            <Link className="underline underline-offset-4" href={AUTH_ROUTES.forgotPassword}>
              Request another reset
            </Link>
          </Alert>
        )}
        <Button block loading={reset.isPending} type="submit">
          Change password
        </Button>
      </form>
    </AuthCard>
  );
};

const ResetPasswordPage: FC = () => {
  return (
    <RequireAnonymous>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </RequireAnonymous>
  );
};

export default ResetPasswordPage;
