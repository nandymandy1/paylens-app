"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AuthCard from "@/components/auth/AuthCard";
import { authKeys } from "@/services/auth.service";
import { reconcileAuthMe } from "@/hooks/useAuth";
import useAuthSessionStore from "@/stores/auth-session";
import { getSafePostAuthRedirect } from "@/utils/auth-redirect";

const AuthCallbackContent: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [attempt, setAttempt] = useState(0);
  const sessionStatus = useAuthSessionStore((state) => state.status);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      // Backend Google callback already set HttpOnly cookies and redirected here.
      let me;

      try {
        me = await queryClient.fetchQuery({ queryKey: authKeys.me(), queryFn: reconcileAuthMe });
      } catch {
        if (!cancelled && useAuthSessionStore.getState().status === "anonymous") {
          router.replace("/login");
        }

        return;
      }

      if (cancelled) {
        return;
      }

      if (me.onboardingRequired) {
        router.replace("/onboarding/organization");
      } else if (me.organizationSelectionRequired) {
        useAuthSessionStore.getState().markAuthenticated();
        router.replace("/select-organization");
      } else {
        useAuthSessionStore.getState().markAuthenticated();
        router.replace(getSafePostAuthRedirect(searchParams.get("redirect_to")));
      }
    };

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [attempt, queryClient, router, searchParams]);

  if (sessionStatus === "auth-error") {
    return (
      <AuthCard
        description="Your Google session is ready, but we could not verify it."
        eyebrow="Google"
        title="Try again"
      >
        <button
          className="text-sm font-medium text-ink underline underline-offset-4"
          onClick={() => setAttempt((value) => value + 1)}
          type="button"
        >
          Retry session verification
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard description="Finishing Google sign-in." eyebrow="Google" title="One moment">
      <p className="font-mono text-xs tracking-[0.05em] text-body uppercase">Resolving session</p>
    </AuthCard>
  );
};

const AuthCallbackPage: FC = () => {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
};

export default AuthCallbackPage;
