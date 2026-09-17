"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, type FC } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Alert from "@/components/ui/Alert";
import AuthCard from "@/components/auth/AuthCard";
import { useVerifyEmail } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";

const VerifyEmailContent: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const verify = useVerifyEmail();
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current || verify.isPending || verify.isSuccess) {
      return;
    }

    started.current = true;
    verify.mutate(token, {
      onSuccess: () => {
        window.setTimeout(() => router.push("/dashboard"), 1200);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <AuthCard
        description="This verification link is missing its token."
        eyebrow="Invalid link"
        title="Link incomplete"
      >
        <Link className="text-sm underline underline-offset-4" href="/login">
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  if (verify.isPending || verify.isIdle) {
    return (
      <AuthCard description="Confirming your email address." eyebrow="Verifying" title="One moment">
        <p className="font-mono text-xs tracking-[0.05em] text-body uppercase">Verifying</p>
      </AuthCard>
    );
  }

  if (verify.isSuccess) {
    return (
      <AuthCard
        description="Your email is confirmed. A session is now active."
        eyebrow="Verified"
        title="Email confirmed"
      >
        <Alert icon={<CheckCircle2 className="size-4" />} title="Success" variant="success">
          Redirecting to your dashboard.
        </Alert>
      </AuthCard>
    );
  }

  const expired =
    verify.error instanceof ApiError && verify.error.code === "EMAIL_VERIFICATION_TOKEN_EXPIRED";

  return (
    <AuthCard
      description={expired ? "This link has expired." : "This link is invalid or already used."}
      eyebrow={expired ? "Expired" : "Invalid"}
      title="Verification failed"
    >
      <Alert icon={<AlertCircle className="size-4" />} title="Link unusable" variant="danger">
        {expired
          ? "Request a new link from the sign-in page."
          : "Check the full link from your email."}{" "}
        <Link className="underline underline-offset-4" href="/login">
          Back to sign in
        </Link>
      </Alert>
    </AuthCard>
  );
};

const VerifyEmailPage: FC = () => {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;
