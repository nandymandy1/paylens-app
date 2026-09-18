"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { Building2, LayoutDashboard, Users, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import cn from "@/utils/cn";
import { isRouteActive, type RouteMatchMode } from "@/utils/navigation";

type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: RouteMatchMode;
  adminOnly?: boolean;
  workforceOnly?: boolean;
};

const NAV_ITEMS: SidebarNavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    match: "exact",
  },
  {
    icon: Users,
    label: "Members",
    adminOnly: true,
    href: "/dashboard/members",
    match: "section",
  },
  {
    icon: UsersRound,
    label: "Employees",
    workforceOnly: true,
    href: "/dashboard/employees",
    match: "section",
  },
  {
    icon: Building2,
    label: "Departments",
    workforceOnly: true,
    href: "/dashboard/departments",
    match: "section",
  },
];

type SidebarBodyProps = {
  collapsed: boolean;
  onNavigate?: () => void;
  showMembersAdmin: boolean;
  showEmployees?: boolean;
};

const SidebarBody: FC<SidebarBodyProps> = ({
  collapsed,
  onNavigate,
  showMembersAdmin,
  showEmployees = true,
}) => {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) {
      return showMembersAdmin;
    }

    if (item.workforceOnly) {
      return showEmployees;
    }

    return true;
  });

  return (
    <nav aria-label="Dashboard">
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isRouteActive(pathname, item.href, item.match);
          const Icon = item.icon;
          const navLink = (
            <Link
              className={cn(
                "relative flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-[background-color,color,transform] duration-150 ease-out hover:translate-x-px hover:bg-canvas-soft",
                active &&
                  "bg-canvas-soft font-medium before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-[linear-gradient(180deg,#FC4C02_0%,#EF2CC1_40%,#BDBBFF_70%,#3455FF_100%)]",
                collapsed && "justify-center px-2",
              )}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
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

export default SidebarBody;
