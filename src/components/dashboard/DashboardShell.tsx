"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FC, type PropsWithChildren } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import IconButton from "@/components/ui/IconButton";
import Popover from "@/components/ui/Popover";
import Tooltip from "@/components/ui/Tooltip";
import useSidebarStore from "@/stores/sidebar";
import useThemeStore from "@/stores/theme";
import { useLogout, useMe } from "@/hooks/useAuth";
import cn from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/members", icon: Users, label: "Members", adminOnly: true },
];

type SidebarBodyProps = {
  collapsed: boolean;
  onNavigate?: () => void;
  showMembersAdmin: boolean;
};

const SidebarBody: FC<SidebarBodyProps> = ({ collapsed, onNavigate, showMembersAdmin }) => {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || showMembersAdmin);

  return (
    <nav aria-label="Dashboard">
      <ul className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const navLink = (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-canvas-soft",
                active && "border-l-2 border-primary bg-canvas-soft font-medium",
                collapsed && "justify-center px-2",
              )}
              href={item.href}
              onClick={onNavigate}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          return (
            <li key={item.href}>
              {collapsed ? (
                <Tooltip content={item.label} side="right">
                  {navLink}
                </Tooltip>
              ) : (
                navLink
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const DashboardShell: FC<PropsWithChildren> = ({ children }) => {
  const logout = useLogout();
  const pathname = usePathname();
  const { data: session } = useMe();
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useSidebarStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const initials = session
    ? `${session.user.firstName.charAt(0)}${session.user.lastName.charAt(0)}`.toUpperCase()
    : "?";
  const activeRole = session?.activeMembership?.role;
  const showMembersAdmin =
    activeRole === "TENANT_OWNER" || activeRole === "HR_ADMIN" || activeRole === "HR_MANAGER";

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-hairline bg-surface transition-[width] duration-200 md:block",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-full flex-col p-3">
          <div
            className={cn(
              "min-h-10 px-3 py-2",
              collapsed && "flex items-center justify-center px-0",
            )}
          >
            {collapsed ? (
              <span className="font-mono text-sm font-medium text-primary">P</span>
            ) : (
              <>
                <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-ink uppercase">
                  PayLens
                </p>
                <p className="mt-0.5 font-mono text-[10px] tracking-[0.05em] text-body uppercase">
                  Compensation OS
                </p>
              </>
            )}
          </div>
          <div className="mt-2 flex-1">
            <SidebarBody collapsed={collapsed} showMembersAdmin={showMembersAdmin} />
          </div>
          <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
            <IconButton
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              icon={collapsed ? <ChevronsRight /> : <ChevronsLeft />}
              onClick={toggleSidebar}
              variant="outline"
            />
          </Tooltip>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Drawer direction="left" onOpenChange={setMobileOpen} open={mobileOpen} title="PayLens">
        <SidebarBody
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
          showMembersAdmin={showMembersAdmin}
        />
      </Drawer>

      <div
        className={cn(
          "min-w-0 transition-[margin-left] duration-200 md:ml-60",
          collapsed && "md:ml-16",
        )}
      >
        <header
          className={cn(
            "fixed top-0 right-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-surface px-4 transition-[left] duration-200 md:left-60 sm:px-6",
            collapsed && "md:left-16",
          )}
        >
          <span className="md:hidden">
            <IconButton
              aria-label="Open navigation"
              icon={<Menu />}
              onClick={() => setMobileOpen(true)}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] tracking-[0.06em] text-body uppercase">
              Organization
            </p>
            <p className="truncate text-sm font-medium">
              {session?.activeOrganization?.name ?? "PayLens"}
            </p>
          </div>
          {session && session.memberships.length > 1 && (
            <Link
              className="text-sm text-body underline-offset-4 hover:underline"
              href="/select-organization"
            >
              Switch organization
            </Link>
          )}
          <IconButton
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            icon={theme === "light" ? <Moon /> : <Sun />}
            onClick={toggleTheme}
            variant="outline"
          />
          <Popover
            align="end"
            content={
              <div className="space-y-4">
                <div>
                  <p className="font-medium">
                    {session ? `${session.user.firstName} ${session.user.lastName}` : "Account"}
                  </p>
                  <p className="mt-1 truncate text-sm text-body">{session?.user.email}</p>
                  {session?.activeMembership && (
                    <p className="mt-2 font-mono text-[10px] tracking-[0.05em] text-body uppercase">
                      {session.activeMembership.role}
                    </p>
                  )}
                </div>
                <div className="border-t border-hairline pt-3">
                  <Button
                    block
                    loading={logout.isPending}
                    onClick={() => logout.mutate()}
                    size="sm"
                    variant="outline"
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    Logout
                  </Button>
                </div>
              </div>
            }
          >
            <button
              aria-label="Open account menu"
              className="flex items-center gap-2 rounded-sm p-1 outline-none hover:bg-canvas-soft focus-visible:ring-2 focus-visible:ring-focus"
              type="button"
            >
              <Avatar alt={session?.user.email ?? "user"} fallback={initials} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium">
                  {session ? `${session.user.firstName} ${session.user.lastName}` : ""}
                </span>
                <span className="block font-mono text-[10px] tracking-[0.05em] text-body uppercase">
                  Account
                </span>
              </span>
            </button>
          </Popover>
        </header>
        <main className="min-h-screen p-4 pt-20 sm:p-8 sm:pt-24" data-active-path={pathname}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
