"use client";

import Link from "next/link";
import { LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState, type FC, type PropsWithChildren } from "react";
import PayLensLogo from "@/components/brand/PayLensLogo";
import LandingFooter from "@/components/landing/LandingFooter";
import { useLogout, useMe } from "@/hooks/useAuth";
import useThemeStore from "@/stores/theme";
import useAuthSessionStore from "@/stores/auth-session";
import { AUTH_ROUTES } from "@/utils/routes";
import cn from "@/utils/cn";

const NAV_LINKS = [
  { href: "/home#product", label: "Product" },
  { href: "/home#how-it-works", label: "How it works" },
  { href: "/home#security", label: "Security" },
  { href: "/docs", label: "Reviewer's Guide" },
];

const PublicLayout: FC<PropsWithChildren> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useThemeStore((s) => s);
  const isDark = theme === "dark";

  const sessionStatus = useAuthSessionStore((s) => s.status);
  const { data: me } = useMe();
  const logout = useLogout();
  const isAuthenticated = sessionStatus === "authenticated" && me;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        isDark ? "bg-[#06061a] text-white" : "bg-[#f4f3f8] text-[#0a0a1a]",
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? isDark
              ? "border-b border-white/8 bg-[rgba(6,6,26,0.82)] shadow-[0_1px_12px_rgb(0,0,0,0.2)] backdrop-blur-xl"
              : "border-b border-black/6 bg-[rgba(255,255,255,0.82)] shadow-[0_1px_12px_rgb(0,0,0,0.06)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <Link aria-label="Go to PayLens home" href="/home">
            <PayLensLogo size="md" variant="full" loading="eager" />
          </Link>
          <nav aria-label="Public" className="hidden items-center gap-6 text-sm md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                className={cn(
                  "text-[13px] transition-colors duration-150",
                  isDark ? "text-white/60 hover:text-white" : "text-black/50 hover:text-black",
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
            <button
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md transition-[background-color,color] duration-150",
                isDark
                  ? "text-white/50 hover:bg-white/10 hover:text-white"
                  : "text-black/40 hover:bg-black/5 hover:text-black",
              )}
              onClick={toggleTheme}
              type="button"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-md border px-4 font-mono text-[11px] font-medium tracking-[0.04em] uppercase backdrop-blur-sm transition-[border-color,background-color,color] duration-150",
                    isDark
                      ? "border-white/15 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white"
                      : "border-black/10 bg-white/60 text-black/60 hover:border-black/20 hover:bg-white hover:text-black",
                  )}
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <button
                  aria-label="Sign out"
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-md transition-[background-color,color] duration-150",
                    isDark
                      ? "text-white/50 hover:bg-white/10 hover:text-white"
                      : "text-black/40 hover:bg-black/5 hover:text-black",
                  )}
                  onClick={() => logout.mutate()}
                  type="button"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-md border px-4 font-mono text-[11px] font-medium tracking-[0.04em] uppercase backdrop-blur-sm transition-[border-color,background-color,color] duration-150",
                    isDark
                      ? "border-white/15 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white"
                      : "border-black/10 bg-white/60 text-black/60 hover:border-black/20 hover:bg-white hover:text-black",
                  )}
                  href={AUTH_ROUTES.login}
                >
                  Sign in
                </Link>
                <Link
                  className="landing-cta-primary inline-flex min-h-9 items-center rounded-md bg-[#0a0a1a] px-4 font-mono text-[11px] font-medium tracking-[0.04em] text-white uppercase transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_4px_20px_rgb(239,44,193,0.25)]"
                  href={AUTH_ROUTES.register}
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <LandingFooter />
    </div>
  );
};

export default PublicLayout;
