"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AuthCard from "@/components/auth/AuthCard";
import { authKeys } from "@/services/auth.service";
import { getSafePostAuthRedirect } from "@/utils/auth-redirect";
import { fetchMe } from "@/services/auth.service";

const AuthCallbackContent: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      // Backend Google callback already set HttpOnly cookies and redirected here.
      const me = await queryClient
        .fetchQuery({ queryKey: authKeys.me(), queryFn: fetchMe })
        .catch(() => null);

      if (cancelled) {
        return;
      }

      if (!me) {
        router.replace("/login");
      } else if (me.onboardingRequired) {
        router.replace("/onboarding/organization");
      } else if (me.organizationSelectionRequired) {
        router.replace("/select-organization");
      } else {
        router.replace(getSafePostAuthRedirect(searchParams.get("redirect_to")));
      }
    };

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [queryClient, router, searchParams]);

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
