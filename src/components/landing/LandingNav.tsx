"use client";

import Link from "next/link";
import { LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import PayLensLogo from "@/components/brand/PayLensLogo";
import PublicMobileMenu from "@/components/landing/PublicMobileMenu";
import { PUBLIC_NAV_LINKS as NAV_LINKS } from "@/components/landing/public-nav-links";
import { useLogout, useMe } from "@/hooks/useAuth";
import useThemeStore from "@/stores/theme";
import useAuthSessionStore from "@/stores/auth-session";
import { AUTH_ROUTES } from "@/utils/routes";
import cn from "@/utils/cn";

const LandingNav: FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const [scrolled, setScrolled] = useState(false);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
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
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-b border-cinema-nav-border bg-cinema-nav-bg shadow-[0_1px_12px_rgb(0,0,0,0.1)] backdrop-blur-xl"
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
              className="text-[13px] text-cinema-nav-text transition-colors duration-150 hover:text-cinema-nav-text-hover"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <button
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex size-9 items-center justify-center rounded-md text-cinema-nav-text transition-[background-color,color] duration-150 hover:bg-cinema-card-border hover:text-cinema-nav-text-hover"
            onClick={toggleTheme}
            type="button"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                className="inline-flex min-h-9 items-center rounded-md border border-cinema-card-border bg-cinema-card-bg px-4 font-mono text-[11px] font-medium tracking-[0.04em] text-cinema-nav-text uppercase backdrop-blur-sm transition-[border-color,background-color,color] duration-150 hover:border-cinema-border-strong hover:text-cinema-nav-text-hover"
                href="/dashboard"
              >
                Dashboard
              </Link>
              <button
                aria-label="Sign out"
                className="inline-flex size-9 items-center justify-center rounded-md text-cinema-nav-text transition-[background-color,color] duration-150 hover:bg-cinema-card-border hover:text-cinema-nav-text-hover"
                onClick={() => logout.mutate()}
                type="button"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                className="inline-flex min-h-9 items-center rounded-md border border-cinema-card-border bg-cinema-card-bg px-4 font-mono text-[11px] font-medium tracking-[0.04em] text-cinema-nav-text uppercase backdrop-blur-sm transition-[border-color,background-color,color] duration-150 hover:border-cinema-border-strong hover:text-cinema-nav-text-hover"
                href={AUTH_ROUTES.login}
              >
                Sign in
              </Link>
              <Link
                className="landing-cta-primary inline-flex min-h-9 items-center rounded-md bg-cinema-cta-bg px-4 font-mono text-[11px] font-medium tracking-[0.04em] text-cinema-cta-text uppercase transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_4px_20px_rgb(239,44,193,0.25)]"
                href={AUTH_ROUTES.register}
              >
                Get started
              </Link>
            </>
          )}
        </nav>
        <PublicMobileMenu tone="cinema" />
      </div>
    </header>
  );
};

export default LandingNav;
