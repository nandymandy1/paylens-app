"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FC, type PropsWithChildren } from "react";
import { ChevronsLeft, ChevronsRight, LayoutDashboard, LogOut, Menu, Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import IconButton from "@/components/ui/IconButton";
import useSidebarStore from "@/stores/sidebar";
import { useLogout, useMe } from "@/hooks/useAuth";
import cn from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/members", icon: Users, label: "Members" },
];

type SidebarBodyProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

const SidebarBody: FC<SidebarBodyProps> = ({ collapsed, onNavigate }) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard">
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-canvas-soft",
                  active && "border-l-2 border-primary bg-canvas-soft font-medium",
                  collapsed && "justify-center px-2",
                )}
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
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

  const initials = session
    ? `${session.user.firstName.charAt(0)}${session.user.lastName.charAt(0)}`.toUpperCase()
    : "?";

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden border-r border-hairline bg-surface transition-all md:block",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-full flex-col p-3">
          <p className="px-3 py-2 font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            {!collapsed && "PayLens"}
          </p>
          <div className="mt-2 flex-1">
            <SidebarBody collapsed={collapsed} />
          </div>
          <IconButton
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            icon={collapsed ? <ChevronsRight /> : <ChevronsLeft />}
            onClick={toggleSidebar}
          />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Drawer direction="left" onOpenChange={setMobileOpen} open={mobileOpen} title="PayLens">
        <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-hairline bg-surface px-4 py-3">
          <span className="md:hidden">
            <IconButton
              aria-label="Open navigation"
              icon={<Menu />}
              onClick={() => setMobileOpen(true)}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {session?.activeOrganization?.name ?? "PayLens"}
            </p>
            {session?.activeMembership && (
              <p className="font-mono text-[11px] tracking-[0.05em] text-body uppercase">
                {session.activeMembership.role}
              </p>
            )}
          </div>
          {session && session.memberships.length > 1 && (
            <Link
              className="text-sm text-body underline-offset-4 hover:underline"
              href="/select-organization"
            >
              Switch organization
            </Link>
          )}
          <span className="flex items-center gap-2">
            <Avatar alt={session?.user.email ?? "user"} fallback={initials} size="sm" />
            <span className="hidden text-sm sm:block">
              {session ? `${session.user.firstName} ${session.user.lastName}` : ""}
            </span>
          </span>
          <Button
            loading={logout.isPending}
            onClick={() => logout.mutate()}
            size="sm"
            variant="outline"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Logout
          </Button>
        </header>
        <main className="flex-1 p-4 sm:p-8" data-active-path={pathname}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
