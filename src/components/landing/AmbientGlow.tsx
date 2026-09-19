"use client";

import type { FC } from "react";
import useThemeStore from "@/stores/theme";

type AmbientGlowProps = {
  className?: string;
  variant?: "warm" | "cool" | "brand" | "hero";
};

const AmbientGlow: FC<AmbientGlowProps> = ({ className = "", variant = "brand" }) => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const gradients: Record<string, string> = {
    warm: isDark
      ? "radial-gradient(ellipse, rgba(252,76,2,0.15) 0%, rgba(239,44,193,0.08) 40%, transparent 70%)"
      : "radial-gradient(ellipse, rgba(252,76,2,0.1) 0%, rgba(239,44,193,0.05) 40%, transparent 70%)",
    cool: isDark
      ? "radial-gradient(ellipse, rgba(189,187,255,0.12) 0%, rgba(200,246,249,0.07) 40%, transparent 70%)"
      : "radial-gradient(ellipse, rgba(189,187,255,0.12) 0%, rgba(200,246,249,0.08) 40%, transparent 70%)",
    brand: isDark
      ? "radial-gradient(ellipse, rgba(239,44,193,0.1) 0%, rgba(189,187,255,0.08) 35%, rgba(52,85,255,0.04) 55%, transparent 72%)"
      : "radial-gradient(ellipse, rgba(239,44,193,0.07) 0%, rgba(189,187,255,0.06) 35%, rgba(52,85,255,0.03) 55%, transparent 72%)",
    hero: isDark
      ? "radial-gradient(ellipse at 60% 40%, rgba(239,44,193,0.12) 0%, rgba(252,76,2,0.08) 25%, rgba(189,187,255,0.1) 50%, rgba(52,85,255,0.05) 70%, transparent 85%)"
      : "radial-gradient(ellipse at 60% 40%, rgba(239,44,193,0.08) 0%, rgba(252,76,2,0.05) 25%, rgba(189,187,255,0.07) 50%, rgba(52,85,255,0.03) 70%, transparent 85%)",
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ background: gradients[variant] }}
    />
  );
};

export default AmbientGlow;
