"use client";

import type { FC } from "react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import Button from "@/components/ui/Button";
import { useProviders } from "@/hooks/useAuth";
import { googleStartUrl } from "@/services/auth.service";

type GoogleButtonProps = {
  redirectTo?: string;
  invitationId?: string;
  label?: string;
};

const GoogleButton: FC<GoogleButtonProps> = ({ invitationId, label, redirectTo }) => {
  const { data, isLoading } = useProviders();

  if (isLoading || !data?.google) {
    return null;
  }

  return (
    <Button
      block
      onClick={() => {
        window.location.href = googleStartUrl({ redirectTo, invitationId });
      }}
      variant="outline"
      prefixIcon={<GoogleIcon className="size-[18px]" />}
    >
      <span>{label ?? "Continue with Google"}</span>
    </Button>
  );
};

export default GoogleButton;
