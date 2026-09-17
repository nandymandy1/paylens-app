"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FC } from "react";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import { useMe, useSwitchOrganization } from "@/hooks/useAuth";
import { getSafePostAuthRedirect } from "@/utils/auth-redirect";

const SelectOrganizationContent: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafePostAuthRedirect(searchParams.get("redirect_to"));
  const { data, isLoading } = useMe();
  const switchOrganization = useSwitchOrganization();

  if (isLoading || !data) {
    return (
      <AuthCard
        description="Loading your organizations."
        eyebrow="Organizations"
        title="One moment"
      >
        <p className="font-mono text-xs tracking-[0.05em] text-body uppercase">Loading</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      description="You belong to more than one organization. Choose where to continue."
      eyebrow="Organizations"
      title="Select organization"
    >
      <ul className="space-y-3">
        {data.memberships.map((membership) => (
          <li
            className="flex items-center justify-between gap-4 rounded-sm border border-hairline p-4"
            key={membership.id}
          >
            <div>
              <p className="font-medium">{membership.organizationName}</p>
              <p className="font-mono text-[11px] tracking-[0.05em] text-body uppercase">
                {membership.role}
              </p>
            </div>
            <Button
              loading={switchOrganization.isPending}
              onClick={() =>
                switchOrganization.mutate(membership.organizationId, {
                  onSuccess: () => router.push(redirectTo),
                })
              }
              size="sm"
              type="button"
            >
              Select
            </Button>
          </li>
        ))}
      </ul>
    </AuthCard>
  );
};

const SelectOrganizationPage: FC = () => {
  return (
    <Suspense>
      <SelectOrganizationContent />
    </Suspense>
  );
};

export default SelectOrganizationPage;
