"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { LayoutDashboard, Users } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import cn from "@/utils/cn";

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Users,
    label: "Members",
    adminOnly: true,
    href: "/dashboard/members",
  },
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
