"use client";

import { usePathname } from "next/navigation";
import { useState, type FC, type PropsWithChildren } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import IconButton from "@/components/ui/IconButton";
import Tooltip from "@/components/ui/Tooltip";
import useSidebarStore from "@/stores/sidebar";
import { useMe } from "@/hooks/useAuth";
import cn from "@/utils/cn";
import SidebarBody from "./SidebarBody";
import DashboardHeader from "./DashboardHeader";
import PayLensLogo from "@/components/brand/PayLensLogo";

const DashboardShell: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const { data: session } = useMe();
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useSidebarStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const activeRole = session?.activeMembership?.role;
  const showMembersAdmin =
    activeRole === "TENANT_OWNER" || activeRole === "HR_ADMIN" || activeRole === "HR_MANAGER";

  return (
    <div className="dashboard-product-shell min-h-screen bg-canvas text-ink">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-hairline bg-surface/95 transition-[width,background-color] duration-200 md:block",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-full flex-col p-3">
          <div
            className={cn(
              "min-h-16 px-3 py-3",
              collapsed && "flex items-center justify-center px-0",
            )}
          >
            <PayLensLogo size={collapsed ? "sm" : "md"} variant={collapsed ? "mark" : "compact"} />
            {!collapsed && (
              <p className="mt-3 font-mono text-[9px] font-medium tracking-[0.1em] text-body uppercase">
                Compensation intelligence
              </p>
            )}
          </div>
          <div className="mt-2 flex-1">
            <SidebarBody collapsed={collapsed} showMembersAdmin={showMembersAdmin} />
          </div>
          <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
            <IconButton
              variant="outline"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              icon={collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            />
          </Tooltip>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Drawer
        direction="left"
        onOpenChange={setMobileOpen}
        open={mobileOpen}
        title={<PayLensLogo size="md" variant="compact" />}
      >
        <SidebarBody
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
          showMembersAdmin={showMembersAdmin}
        />
      </Drawer>

      <div
        className={cn(
          "min-w-0 transition-[margin-left] duration-200",
          collapsed ? "md:ml-16" : "md:ml-60",
        )}
      >
        <DashboardHeader
          sidebarCollapsed={collapsed}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />
        <main
          className="relative min-h-screen w-full overflow-hidden px-4 pt-20 pb-6 md:px-6 md:pt-24 md:pb-8 lg:px-8"
          data-active-path={pathname}
        >
          <div aria-hidden="true" className="dashboard-canvas-aura" />
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
