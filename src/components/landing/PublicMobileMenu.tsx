"use client";

import Link from "next/link";
import { LogOut, Menu, Moon, Sun, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState, type FC } from "react";
import PayLensLogo from "@/components/brand/PayLensLogo";
import { PUBLIC_NAV_LINKS } from "@/components/landing/public-nav-links";
import { useLogout, useMe } from "@/hooks/useAuth";
import useThemeStore from "@/stores/theme";
import useAuthSessionStore from "@/stores/auth-session";
import { AUTH_ROUTES } from "@/utils/routes";
import cn from "@/utils/cn";

type PublicMobileMenuProps = {
  /** cinema = landing header tokens, adaptive = docs/public header light-dark tokens */
  tone: "cinema" | "adaptive";
  isDark?: boolean;
};

const PublicMobileMenu: FC<PublicMobileMenuProps> = ({ tone, isDark = false }) => {
  const [open, setOpen] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const dark = theme === "dark";

  const sessionStatus = useAuthSessionStore((s) => s.status);
  const { data: me } = useMe();
  const logout = useLogout();
  const isAuthenticated = sessionStatus === "authenticated" && me;

  const close = () => setOpen(false);
  const signOut = () => {
    logout.mutate();
    close();
  };

  const overlay = "fixed inset-0 z-50 bg-black/55 backdrop-blur-sm";
  const surface =
    tone === "cinema"
      ? "border-cinema-nav-border bg-cinema-nav-bg"
      : cn(
          "border-b",
          isDark
            ? "border-white/8 bg-[rgba(6,6,26,0.97)] text-white"
            : "border-black/8 bg-white/97 text-[#0a0a1a]",
        );
  const linkRowBorder =
    tone === "cinema"
      ? "border-cinema-card-border"
      : cn(isDark ? "border-white/10" : "border-black/10");
  const linkText =
    tone === "cinema"
      ? "text-cinema-nav-text hover:text-cinema-nav-text-hover"
      : cn(isDark ? "text-white/70 hover:text-white" : "text-black/60 hover:text-black");
  const iconButton =
    tone === "cinema"
      ? "text-cinema-nav-text hover:bg-cinema-card-border hover:text-cinema-nav-text-hover"
      : cn(
          isDark
            ? "text-white/60 hover:bg-white/10 hover:text-white"
            : "text-black/50 hover:bg-black/5 hover:text-black",
        );
  const outlineCta =
    tone === "cinema"
      ? "border-cinema-card-border bg-cinema-card-bg text-cinema-nav-text hover:border-cinema-border-strong hover:text-cinema-nav-text-hover"
      : cn(
          "border",
          isDark
            ? "border-white/15 bg-white/5 text-white/80 hover:border-white/25 hover:text-white"
            : "border-black/10 bg-white text-black/60 hover:border-black/20 hover:text-black",
        );

  return (
    <DialogPrimitive.Root onOpenChange={setOpen} open={open}>
      <DialogPrimitive.Trigger asChild>
        <button
          aria-controls="public-mobile-menu"
          aria-expanded={open}
          aria-label="Open menu"
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-md transition-colors duration-150 md:hidden",
            iconButton,
          )}
          type="button"
        >
          <Menu aria-hidden="true" size={20} />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            overlay,
            "data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in motion-reduce:animate-none",
          )}
        />
        <DialogPrimitive.Content
          aria-label="Public navigation"
          className={cn(
            "fixed inset-x-0 top-0 z-[60] max-h-[100dvh] overflow-y-auto border-b px-4 pt-4 pb-8 backdrop-blur-xl outline-none",
            "data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 motion-reduce:animate-none",
            surface,
          )}
          id="public-mobile-menu"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-center justify-between py-2">
              <Link aria-label="Go to PayLens home" href="/home" onClick={close}>
                <PayLensLogo size="md" variant="full" loading="eager" />
              </Link>
              <DialogPrimitive.Close
                aria-label="Close menu"
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-md transition-colors duration-150",
                  iconButton,
                )}
              >
                <X aria-hidden="true" size={20} />
              </DialogPrimitive.Close>
            </div>
            <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
            <nav aria-label="Public mobile" className="mt-2">
              {PUBLIC_NAV_LINKS.map((link) => (
                <Link
                  className={cn(
                    "flex min-h-11 items-center border-b py-2 text-base font-medium transition-colors duration-150",
                    linkRowBorder,
                    linkText,
                  )}
                  href={link.href}
                  key={link.href}
                  onClick={close}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <button
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className={cn(
                "mt-2 flex min-h-11 w-full items-center justify-between text-sm transition-colors duration-150",
                linkText,
              )}
              onClick={toggleTheme}
              type="button"
            >
              <span>Theme: {dark ? "Dark" : "Light"}</span>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated ? (
              <div className="mt-4 grid gap-3">
                <Link
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-md border px-4 font-mono text-[12px] font-medium tracking-[0.04em] uppercase transition-colors duration-150",
                    outlineCta,
                  )}
                  href="/dashboard"
                  onClick={close}
                >
                  Dashboard
                </Link>
                <button
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 font-mono text-[12px] font-medium tracking-[0.04em] uppercase transition-colors duration-150",
                    outlineCta,
                  )}
                  onClick={signOut}
                  type="button"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <Link
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-md border px-4 font-mono text-[12px] font-medium tracking-[0.04em] uppercase transition-colors duration-150",
                    outlineCta,
                  )}
                  href={AUTH_ROUTES.login}
                  onClick={close}
                >
                  Sign in
                </Link>
                <Link
                  className="landing-cta-primary inline-flex min-h-11 items-center justify-center rounded-md bg-cinema-cta-bg px-4 font-mono text-[12px] font-medium tracking-[0.04em] text-cinema-cta-text uppercase transition-[transform,box-shadow] duration-150"
                  href={AUTH_ROUTES.register}
                  onClick={close}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default PublicMobileMenu;
