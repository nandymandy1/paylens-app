"use client";

import { usePathname } from "next/navigation";
import { useState, type FC, type PropsWithChildren } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import IconButton from "@/components/ui/IconButton";
import Tooltip from "@/components/ui/Tooltip";
import useSidebarStore from "@/stores/sidebar";
import { useMe } from "@/hooks/useAuth";
import { EMPLOYEE_DIRECTORY_ROLES } from "@/types/employee.type";
import { MEMBER_ADMIN_ROLES } from "@/types/organization.type";
import cn from "@/utils/cn";
import SidebarBody from "./SidebarBody";
import DashboardHeader from "./DashboardHeader";
import PayLensLogo from "@/components/brand/PayLensLogo";

const DashboardShell: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const { data: session } = useMe();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sidebarCollapsed: collapsed, toggleSidebar } = useSidebarStore((state) => state);

  const activeRole = session?.activeMembership?.role;
  const showMembersAdmin = activeRole
    ? (MEMBER_ADMIN_ROLES as readonly string[]).includes(activeRole)
    : false;
  const showEmployees = activeRole
    ? (EMPLOYEE_DIRECTORY_ROLES as readonly string[]).includes(activeRole)
    : false;

  return (
    <div className="dashboard-product-shell min-h-screen bg-canvas text-ink">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-hairline bg-surface-sidebar/95 backdrop-blur-sm transition-[width,background-color] duration-200 md:block",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-full flex-col p-3">
          <div
            className={cn(
              "min-h-16 px-3 py-4",
              collapsed && "flex items-center justify-center px-0",
            )}
          >
            <div className={cn(!collapsed && "relative")}>
              <PayLensLogo
                size={collapsed ? "sm" : "md"}
                variant={collapsed ? "mark" : "compact"}
              />
              {!collapsed && (
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="inline-block h-px flex-1 bg-gradient-to-r from-brand-orange via-brand-magenta to-brand-periwinkle opacity-30" />
                  <span className="font-mono text-[8px] font-medium tracking-[0.12em] text-body/60 uppercase">
                    Intelligence
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 flex-1">
            <SidebarBody
              collapsed={collapsed}
              showEmployees={showEmployees}
              showMembersAdmin={showMembersAdmin}
            />
          </div>
          <div className="border-t border-hairline pt-3">
            <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
              <IconButton
                variant="outline"
                onClick={toggleSidebar}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                icon={collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
              />
            </Tooltip>
          </div>
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
          showEmployees={showEmployees}
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
          <div aria-hidden="true" className="dashboard-canvas-aura-secondary" />
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
