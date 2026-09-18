"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, MailCheck } from "lucide-react";
import Alert from "@/components/ui/Alert";
import AuthCard from "@/components/auth/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import { RequireAnonymous } from "@/components/auth/AuthGuards";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import InputEmail from "@/components/ui/InputEmail";
import InputPassword from "@/components/ui/InputPassword";
import { useRegister } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { registerSchema, type RegisterInput } from "@/types/auth.type";

const RegisterPage: FC = () => {
  const register = useRegister();
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register: registerField,
    setError,
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (values: RegisterInput) => {
    register.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiError && error.code === "EMAIL_ALREADY_REGISTERED") {
          setError("email", {
            message: "An account with this email already exists. Sign in instead.",
          });
        } else {
          setError("root", { message: "Registration failed. Review the fields and try again." });
        }
      },
      onSuccess: (_result, variables) => {
        setRegisteredEmail(variables.email);
      },
    });
  };

  if (registeredEmail) {
    return (
      <AuthCard
        description={`We sent a verification link to ${registeredEmail}. Confirm your email to finish creating your organization.`}
        eyebrow="Check your inbox"
        title="Verification email sent"
      >
        <Alert icon={<MailCheck className="size-4" />} title="Next step" variant="success">
          Open the link within 24 hours. You can request a new link from the sign-in page if it
          expires.
        </Alert>
        <div className="mt-6">
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center rounded-sm bg-primary px-4 font-mono text-sm font-medium tracking-[0.005em] text-on-primary uppercase transition-opacity hover:opacity-80"
            href="/login"
          >
            Go to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <RequireAnonymous>
      <AuthCard
        description="Create your organization and become its tenant owner."
        eyebrow="Create organization"
        title="Start with PayLens"
      >
        <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
          <FormField
            error={errors.organizationName?.message}
            id="organizationName"
            label="Organization name"
            required
          >
            <Input
              autoComplete="organization"
              id="organizationName"
              placeholder="Acme Industries"
              {...registerField("organizationName")}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField error={errors.firstName?.message} id="firstName" label="First name" required>
              <Input
                placeholder="First Name"
                autoComplete="given-name"
                id="firstName"
                {...registerField("firstName")}
              />
            </FormField>
            <FormField error={errors.lastName?.message} id="lastName" label="Last name" required>
              <Input
                placeholder="Last Name"
                autoComplete="family-name"
                id="lastName"
                {...registerField("lastName")}
              />
            </FormField>
          </div>
          <FormField error={errors.email?.message} id="email" label="Work email" required>
            <InputEmail
              autoComplete="email"
              id="email"
              placeholder="you@company.com"
              {...registerField("email")}
            />
          </FormField>
          <FormField
            error={errors.password?.message}
            helpText="At least 12 characters. Passphrases welcome."
            id="password"
            label="Password"
            required
          >
            <InputPassword
              autoComplete="new-password"
              id="password"
              placeholder="Password"
              {...registerField("password")}
            />
          </FormField>
          <FormField
            error={errors.confirmPassword?.message}
            id="confirmPassword"
            label="Confirm password"
            required
          >
            <InputPassword
              autoComplete="new-password"
              id="confirmPassword"
              placeholder="Confirm password"
              {...registerField("confirmPassword")}
            />
          </FormField>
          {errors.root?.message && (
            <Alert
              icon={<AlertCircle className="size-4" />}
              title="Registration failed"
              variant="danger"
            >
              {errors.root.message}
            </Alert>
          )}
          <Button block loading={register.isPending} type="submit">
            Create organization
          </Button>
        </form>
        <div className="mt-4">
          <GoogleButton label="Continue with Google" />
        </div>
        <p className="mt-6 text-sm text-body">
          Already have an account?{" "}
          <Link className="underline underline-offset-4" href="/login">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </RequireAnonymous>
  );
};

export default RegisterPage;
