"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import type { FC, PropsWithChildren } from "react";
import PayLensLogo from "@/components/brand/PayLensLogo";
import useThemeStore from "@/stores/theme";
import cn from "@/utils/cn";

type AuthCardVariant =
  | "login"
  | "register"
  | "forgot"
  | "reset"
  | "verify"
  | "invite"
  | "select"
  | "onboarding"
  | "callback"
  | "default";

type AuthCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description?: string;
  variant?: AuthCardVariant;
}>;

const variantCopy: Record<AuthCardVariant, { headline: string; sceneBody: string }> = {
  login: {
    headline: "See the bigger picture in pay.",
    sceneBody: "Turn compensation data into clear decisions, fair growth, and stronger teams.",
  },
  register: {
    headline: "Build compensation clarity from day one.",
    sceneBody: "Set up your organization and start managing compensation with confidence.",
  },
  forgot: {
    headline: "Secure access to sensitive pay data.",
    sceneBody: "We will send a password reset link to your registered email.",
  },
  reset: {
    headline: "Secure access to sensitive pay data.",
    sceneBody: "Choose a new password to protect your workspace.",
  },
  verify: {
    headline: "Confirm your identity. Protect your workspace.",
    sceneBody: "Email verification ensures your organization stays secure.",
  },
  invite: {
    headline: "Join your organization's compensation workspace.",
    sceneBody: "Accept your invitation and start contributing to compensation clarity.",
  },
  select: {
    headline: "One identity. The right workspace.",
    sceneBody: "Switch between organizations with a single secure session.",
  },
  onboarding: {
    headline: "Build compensation clarity from day one.",
    sceneBody: "Create your organization and become its tenant owner.",
  },
  callback: {
    headline: "See the bigger picture in pay.",
    sceneBody: "Finishing secure sign-in.",
  },
  default: {
    headline: "See the bigger picture in pay.",
    sceneBody: "Compensation intelligence, made clear.",
  },
};

const AuthCard: FC<AuthCardProps> = ({
  children,
  description,
  eyebrow,
  title,
  variant = "default",
}) => {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === "dark";
  const scene = variantCopy[variant] ?? variantCopy.default;

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col overflow-hidden lg:grid lg:grid-cols-2",
        isDark ? "bg-[#06061a] text-white" : "bg-[#f7f7fb] text-[#11111d]",
      )}
    >
      {/* Header — PayLens home + theme toggle */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-8 lg:px-16">
        <Link
          aria-label="Go to PayLens home"
          className="inline-flex items-center gap-2 transition-opacity duration-150 hover:opacity-80"
          href="/home"
        >
          <PayLensLogo size="sm" loading="eager" />
        </Link>
        <button
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-md transition-[background-color,color] duration-150",
            isDark
              ? "text-white/50 hover:bg-white/10 hover:text-white"
              : "text-[#55586a] hover:bg-black/5 hover:text-[#11111d]",
          )}
          onClick={toggleTheme}
          type="button"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* LEFT — form side */}
      <section
        className={cn(
          "relative flex flex-1 items-center px-4 pt-20 pb-16 sm:px-8 lg:px-16",
          isDark ? "bg-[#0a0a22]" : "bg-[#f7f7fb]",
        )}
      >
        {/* Ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full blur-3xl"
          style={{
            opacity: isDark ? 0.4 : 0.5,
            background: isDark
              ? "radial-gradient(circle, rgba(189,187,255,0.12) 0%, rgba(239,44,193,0.06) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(189,187,255,0.2) 0%, rgba(200,246,249,0.12) 40%, transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl"
          style={{
            opacity: isDark ? 0.3 : 0.4,
            background: isDark
              ? "radial-gradient(circle, rgba(252,76,2,0.08) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(239,44,193,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="auth-form-entrance relative z-10 mx-auto w-full max-w-[27.5rem]">
          {/* Form card */}
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border p-8",
              isDark
                ? "border-white/10 bg-[#0e0e2a] shadow-[0_4px_24px_rgb(0,0,0,0.3)]"
                : "border-[#d9dbe7] bg-white shadow-[0_4px_24px_rgb(0,0,0,0.06)]",
            )}
          >
            {/* Gradient accent top */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, #FC4C02 0%, #EF2CC1 35%, #BDBBFF 65%, #C8F6F9 100%)",
              }}
            />

            {/* Logo — clickable to /home */}
            <Link
              aria-label="Go to PayLens home"
              className="auth-logo-entrance mb-8 inline-block"
              href="/home"
            >
              <PayLensLogo size="md" loading="eager" />
            </Link>

            <p
              className={cn(
                "font-mono text-[10px] font-medium tracking-[0.08em] uppercase",
                isDark ? "text-white/50" : "text-[#737689]",
              )}
            >
              {eyebrow}
            </p>
            <h1 className="mt-3 text-2xl leading-8 font-medium tracking-tight">{title}</h1>
            {description && (
              <p
                className={cn(
                  "mt-2 text-base leading-6",
                  isDark ? "text-white/55" : "text-[#55586a]",
                )}
              >
                {description}
              </p>
            )}

            <div className="mt-6">{children}</div>
          </div>
        </div>
      </section>

      {/* RIGHT — cinematic brand panel */}
      <aside
        className={cn(
          "auth-brand-panel relative hidden overflow-hidden px-12 py-12 lg:flex lg:flex-col xl:px-16 xl:py-16",
          isDark
            ? "bg-[#0a0a1a] text-white"
            : "bg-gradient-to-br from-[#f0eff4] via-[#edeaf2] to-[#e8e4f0] text-[#11111d]",
        )}
      >
        {/* Warm glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full blur-3xl"
          style={{
            opacity: isDark ? 0.35 : 0.5,
            background: isDark
              ? "radial-gradient(circle, rgba(252,76,2,0.25) 0%, rgba(239,44,193,0.12) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(252,76,2,0.12) 0%, rgba(239,44,193,0.06) 40%, transparent 70%)",
          }}
        />
        {/* Cool glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full blur-3xl"
          style={{
            opacity: isDark ? 0.25 : 0.4,
            background: isDark
              ? "radial-gradient(circle, rgba(189,187,255,0.18) 0%, rgba(200,246,249,0.1) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(189,187,255,0.15) 0%, rgba(200,246,249,0.1) 40%, transparent 70%)",
          }}
        />

        <div className="auth-brand-content relative z-10 mx-auto flex h-full w-full max-w-[34rem] flex-col">
          {/* Logo */}
          <Link
            aria-label="Go to PayLens home"
            className="auth-brand-enter auth-brand-enter-1 inline-block"
            href="/home"
          >
            <PayLensLogo size="md" theme={isDark ? "dark" : "light"} />
          </Link>

          <div className="relative my-auto pt-16 pb-12">
            {/* Large decorative PayLens mark */}
            <div aria-hidden="true" className="auth-brand-glow" />
            <div className="relative">
              <svg
                aria-hidden="true"
                className={cn(
                  "auth-brand-mark auth-brand-enter auth-brand-enter-2 h-56 w-auto xl:h-64",
                  isDark ? "opacity-[0.06]" : "opacity-[0.15]",
                )}
                viewBox="0 0 96 112"
                fill="none"
              >
                <defs>
                  <linearGradient id="auth-mark-grad" x1="0" y1="0" x2="96" y2="112">
                    <stop offset="0%" stopColor="#FC4C02" />
                    <stop offset="40%" stopColor="#EF2CC1" />
                    <stop offset="70%" stopColor="#BDBBFF" />
                    <stop offset="100%" stopColor="#3455FF" />
                  </linearGradient>
                </defs>
                <path
                  d="M48 0C20 0 0 16 0 40C0 68 22 88 48 112C74 88 96 68 96 40C96 16 76 0 48 0Z"
                  fill="url(#auth-mark-grad)"
                />
              </svg>
            </div>

            {/* Product scene cards */}
            <div className="auth-brand-enter auth-brand-enter-2 mt-6 space-y-3">
              <div
                className={cn(
                  "rounded-lg border p-3 backdrop-blur-sm",
                  isDark ? "border-white/10 bg-white/5" : "border-[#d9dbe7] bg-white/80",
                )}
              >
                <p
                  className={cn(
                    "font-mono text-[9px] tracking-[0.1em] uppercase",
                    isDark ? "text-white/40" : "text-[#737689]",
                  )}
                >
                  Current compensation
                </p>
                <p
                  className={cn(
                    "mt-1 text-lg font-semibold",
                    isDark ? "text-white/90" : "text-[#11111d]",
                  )}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  INR 34,00,000
                </p>
              </div>
              <div
                className={cn(
                  "ml-4 rounded-lg border p-3 backdrop-blur-sm",
                  isDark ? "border-white/8 bg-white/3" : "border-[#d9dbe7]/60 bg-white/60",
                )}
              >
                <div className="space-y-1.5">
                  {[
                    { label: "Annual Review", delta: "+14.8%" },
                    { label: "Promotion", delta: "+11.2%" },
                    { label: "Initial", delta: null },
                  ].map((item) => (
                    <div className="flex items-center gap-2" key={item.label}>
                      <span className="size-1.5 rounded-full bg-[#EF2CC1]" />
                      <span
                        className={cn("text-[10px]", isDark ? "text-white/50" : "text-[#55586a]")}
                      >
                        {item.label}
                      </span>
                      {item.delta && (
                        <span
                          className={cn(
                            "ml-auto font-mono text-[9px]",
                            isDark ? "text-emerald-400/70" : "text-emerald-600",
                          )}
                        >
                          {item.delta}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p
              className={cn(
                "auth-brand-enter auth-brand-enter-3 mt-8 font-mono text-[11px] font-medium tracking-[0.1em] uppercase",
                isDark ? "text-white/50" : "text-[#737689]",
              )}
            >
              Compensation intelligence
            </p>
            <p
              className={cn(
                "auth-brand-enter auth-brand-enter-4 mt-3 max-w-md text-3xl leading-[1.08] font-medium tracking-tight xl:text-[2.5rem]",
                isDark ? "text-white" : "text-[#11111d]",
              )}
            >
              {scene.headline}
            </p>
          </div>

          <div className="auth-brand-enter auth-brand-enter-5 mt-auto">
            <p
              className={cn(
                "max-w-sm text-sm leading-6",
                isDark ? "text-white/50" : "text-[#55586a]",
              )}
            >
              {scene.sceneBody}
            </p>
            <div
              className={cn(
                "mt-6 h-px",
                isDark
                  ? "bg-gradient-to-r from-[#FC4C02]/30 via-[#EF2CC1]/20 to-[#BDBBFF]/15"
                  : "bg-gradient-to-r from-[#FC4C02]/40 via-[#EF2CC1]/30 to-[#BDBBFF]/20",
              )}
            />
            <p
              className={cn(
                "mt-4 font-mono text-[10px] font-medium tracking-[0.1em] uppercase",
                isDark ? "text-white/30" : "text-[#8585a0]",
              )}
            >
              PayLens / Compensation OS
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AuthCard;
