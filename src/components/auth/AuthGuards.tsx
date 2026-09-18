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
  const sessionStatus = useAuthSessionStore((state) => state.status);
  const { data, isLoading, refetch } = useMe();

  useEffect(() => {
    // Known anonymous must redirect immediately — never hang on a disabled probe.
    if (sessionStatus === "anonymous") {
      const query = searchParams.toString();
      const current = redirectTo ?? `${pathname}${query ? `?${query}` : ""}`;
      const target = getSafePostAuthRedirect(current);

      router.replace(`/login?redirect_to=${encodeURIComponent(target)}`);

      return;
    }

    if (
      isLoading ||
      sessionStatus === "auth-error" ||
      (sessionStatus === "authenticated" && data)
    ) {
      return;
    }
  }, [data, isLoading, pathname, redirectTo, router, searchParams, sessionStatus]);

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

  if (sessionStatus === "auth-error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center text-body">
        <p className="font-medium text-ink">Unable to verify your session</p>
        <p className="text-sm">Check your connection and try again.</p>
        <button
          className="text-sm font-medium text-ink underline underline-offset-4"
          onClick={() => void refetch()}
          type="button"
        >
          Retry
        </button>
      </main>
    );
  }

  if (isLoading || sessionStatus !== "authenticated" || !data) {
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
