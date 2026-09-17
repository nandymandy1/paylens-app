"use client";

import { useRouter } from "next/navigation";
import { useEffect, type FC, type PropsWithChildren } from "react";
import { useMe } from "@/hooks/useAuth";
import { getSafeRedirectPath } from "@/services/auth.service";

type GuardProps = PropsWithChildren<{
  redirectTo?: string;
}>;

/** Renders protected content once the backend session is confirmed. */
export const RequireAuth: FC<GuardProps> = ({ children, redirectTo }) => {
  const router = useRouter();
  const { data, error, isLoading } = useMe();

  useEffect(() => {
    if (isLoading || data) {
      return;
    }

    if (error) {
      const target = getSafeRedirectPath(redirectTo ?? null);

      router.replace(`/login?redirect_to=${encodeURIComponent(target)}`);
    }
  }, [data, error, isLoading, redirectTo, router]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (data.onboardingRequired) {
      router.replace("/onboarding/organization");
    } else if (data.organizationSelectionRequired) {
      router.replace("/select-organization");
    }
  }, [data, router]);

  if (isLoading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas text-body">
        <p className="font-mono text-xs tracking-[0.05em] uppercase">Loading session</p>
      </main>
    );
  }

  return <>{children}</>;
};

/** Redirects already-authenticated sessions away from auth pages. */
export const RequireAnonymous: FC<GuardProps> = ({ children, redirectTo }) => {
  const router = useRouter();
  const { data, isLoading } = useMe();

  useEffect(() => {
    if (isLoading || !data) {
      return;
    }

    if (!data.onboardingRequired && !data.organizationSelectionRequired) {
      router.replace(getSafeRedirectPath(redirectTo ?? null));
    }
  }, [data, isLoading, redirectTo, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas text-body">
        <p className="font-mono text-xs tracking-[0.05em] uppercase">Loading session</p>
      </main>
    );
  }

  return <>{children}</>;
};
