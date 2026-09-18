"use client";

import Link from "next/link";
import type { FC } from "react";
import { ChevronDown, LogOut, Menu, Moon, Sun } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Popover from "@/components/ui/Popover";
import { useLogout, useMe } from "@/hooks/useAuth";
import useThemeStore from "@/stores/theme";
import cn from "@/utils/cn";
import { formatEnumLabel, getInitials } from "@/utils/string";
import PayLensLogo from "@/components/brand/PayLensLogo";

type DashboardHeaderProps = {
  sidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
};

const DashboardHeader: FC<DashboardHeaderProps> = ({ onOpenMobileSidebar, sidebarCollapsed }) => {
  const logout = useLogout();
  const { data: session } = useMe();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const initials = session ? getInitials(session.user.firstName, session.user.lastName) : "?";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-surface/95 px-4 backdrop-blur-sm transition-[left,background-color] duration-200 md:px-6 lg:px-8",
        sidebarCollapsed ? "md:left-16" : "md:left-60",
      )}
    >
      <span className="md:hidden">
        <IconButton aria-label="Open navigation" icon={<Menu />} onClick={onOpenMobileSidebar} />
      </span>
      <PayLensLogo className="shrink-0 md:hidden" size="sm" variant="compact" />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] tracking-[0.06em] text-body uppercase">Organization</p>
        <p className="truncate text-sm font-medium">
          {session?.activeOrganization?.name ?? "PayLens"}
        </p>
      </div>
      {session && session.memberships.length > 1 && (
        <Link className="auth-link text-sm text-body" href="/select-organization">
          Switch organization
        </Link>
      )}
      <IconButton
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        icon={
          theme === "light" ? (
            <Moon className="transition-transform duration-150 hover:rotate-12" size={16} />
          ) : (
            <Sun className="transition-transform duration-150 hover:rotate-12" size={16} />
          )
        }
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
                  {formatEnumLabel(session.activeMembership.role)}
                </p>
              )}
            </div>
            <div className="border-t border-hairline pt-3">
              <Button
                block
                loading={logout.isPending}
                onClick={() => logout.mutate()}
                prefixIcon={<LogOut size={14} />}
                size="sm"
                variant="outline"
              >
                Logout
              </Button>
            </div>
          </div>
        }
      >
        <button
          aria-label="Open account menu"
          className="flex items-center gap-2 rounded-sm p-1.5 outline-none transition-[background-color,transform] duration-150 hover:bg-canvas-soft hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-focus"
          type="button"
        >
          <Avatar alt={session?.user.email ?? "user"} fallback={initials} size="sm" />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium">
              {session ? `${session.user.firstName} ${session.user.lastName}` : ""}
            </span>
            <span className="block font-mono text-[10px] tracking-[0.05em] text-body uppercase">
              {session?.activeMembership?.role
                ? formatEnumLabel(session.activeMembership.role)
                : "Account"}
            </span>
          </span>
          <ChevronDown aria-hidden="true" className="hidden size-3.5 text-body sm:block" />
        </button>
      </Popover>
    </header>
  );
};

export default DashboardHeader;
