"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FC } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import AuthCard from "@/components/auth/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import { RequireAnonymous } from "@/components/auth/AuthGuards";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import InputEmail from "@/components/ui/InputEmail";
import InputPassword from "@/components/ui/InputPassword";
import { useLogin } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { getSafePostAuthRedirect } from "@/utils/auth-redirect";
import { loginSchema, type LoginInput } from "@/types/auth.type";

const LoginForm: FC<{ redirectTo: string }> = ({ redirectTo }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordReset = searchParams.get("password_reset") === "success";
  const login = useLogin();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginInput) => {
    login.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED") {
          setError("root", { message: "Verify your email before signing in. Check your inbox." });
        } else if (error instanceof ApiError && error.code === "ACCOUNT_SUSPENDED") {
          setError("root", { message: "This account has been suspended." });
        } else {
          setError("root", { message: "Email or password is incorrect." });
        }
      },
      onSuccess: () => {
        router.push(redirectTo);
      },
    });
  };

  return (
    <AuthCard
      description="Sign in to your PayLens organization."
      eyebrow="Sign in"
      title="Welcome back"
    >
      {passwordReset && (
        <Alert title="Password updated" variant="success">
          Your password has been changed. Sign in with the new password.
        </Alert>
      )}
      <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
        <FormField error={errors.email?.message} id="email" label="Work email" required>
          <InputEmail
            autoComplete="email"
            id="email"
            placeholder="you@company.com"
            {...register("email")}
          />
        </FormField>
        <FormField error={errors.password?.message} id="password" label="Password" required>
          <InputPassword autoComplete="current-password" id="password" {...register("password")} />
        </FormField>
        {errors.root?.message && (
          <Alert icon={<AlertCircle className="size-4" />} title="Sign in failed" variant="danger">
            {errors.root.message}
          </Alert>
        )}
        <Button block loading={login.isPending} type="submit">
          Sign in
        </Button>
      </form>
      <div className="mt-4">
        <GoogleButton redirectTo={redirectTo} />
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="text-body underline-offset-4 hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="text-body underline-offset-4 hover:underline" href="/register">
          Create organization
        </Link>
      </div>
    </AuthCard>
  );
};

const LoginFlow: FC = () => {
  const searchParams = useSearchParams();
  const redirectTo = getSafePostAuthRedirect(searchParams.get("redirect_to"));

  return (
    <RequireAnonymous redirectTo={redirectTo}>
      <LoginForm redirectTo={redirectTo} />
    </RequireAnonymous>
  );
};

const LoginPage: FC = () => {
  return (
    <Suspense>
      <LoginFlow />
    </Suspense>
  );
};

export default LoginPage;
