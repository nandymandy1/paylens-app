import type { FC, PropsWithChildren } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { RequireAuth } from "@/components/auth/AuthGuards";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
};

export default DashboardLayout;
