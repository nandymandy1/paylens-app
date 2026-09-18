"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, type FC, type PropsWithChildren } from "react";
import { useMe } from "@/hooks/useAuth";
import useAuthSessionStore from "@/stores/auth-session";
import { getSafePostAuthRedirect } from "@/utils/auth-redirect";

type GuardProps = PropsWithChildren<{
  redirectTo?: string | null;
}>;

/** Renders protected content once the backend session is confirmed. */
export const RequireAuth: FC<GuardProps> = ({ children, redirectTo }) => {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-canvas text-body">
          <p className="font-mono text-xs tracking-[0.05em] uppercase">Loading session</p>
        </main>
      }
    >
      <RequireAuthInner redirectTo={redirectTo}>{children}</RequireAuthInner>
    </Suspense>
  );
};

const RequireAuthInner: FC<GuardProps> = ({ children, redirectTo }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, error, isLoading } = useMe();

  useEffect(() => {
    if (isLoading || data) {
      return;
    }

    if (error) {
      const query = searchParams.toString();
      const current = redirectTo ?? `${pathname}${query ? `?${query}` : ""}`;
      const target = getSafePostAuthRedirect(current);

      router.replace(`/login?redirect_to=${encodeURIComponent(target)}`);
    }
  }, [data, error, isLoading, pathname, redirectTo, router, searchParams]);

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

/**
 * Redirects already-authenticated sessions away from auth pages using the same
 * canonical sanitized redirect. Anonymous sessions (failed useMe) render
 * normally — a 401 probe is expected state here, not a navigation event.
 */
export const RequireAnonymous: FC<GuardProps> = ({ children, redirectTo }) => {
  const router = useRouter();
  // Known anonymous sessions (e.g. right after explicit logout) already know
  // the outcome: render directly without probing /auth/me or refreshing.
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const { data, isLoading } = useMe({ enabled: sessionStatus !== "anonymous" });

  useEffect(() => {
    if (isLoading || !data) {
      return;
    }

    if (!data.onboardingRequired && !data.organizationSelectionRequired) {
      router.replace(getSafePostAuthRedirect(redirectTo ?? null));
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
