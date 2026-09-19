"use client";

import type { FC } from "react";
import { Moon, Sun } from "lucide-react";
import useThemeStore from "@/stores/theme";
import IconButton from "@/components/ui/IconButton";
import ShowcaseSection from "./ShowcaseSection";

const swatches = [
  { label: "Canvas", className: "bg-canvas" },
  { label: "Soft", className: "bg-surface-subtle" },
  { label: "Dark", className: "bg-canvas-dark" },
  { label: "Mint", className: "bg-accent-mint" },
  { label: "Periwinkle", className: "bg-accent-periwinkle" },
];
const FoundationsSection: FC = () => {
  const { theme, toggleTheme } = useThemeStore((s) => s);

  return (
    <ShowcaseSection
      description="A four-pixel rhythm, hairline borders, geometric display type, and mono utility labels anchor every surface."
      eyebrow="01 / Foundations"
      id="foundations"
      title="The system starts with contrast"
    >
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-hairline bg-surface p-5">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
              Active theme
            </p>
            <p className="mt-1 text-xl font-medium capitalize">{theme} mode</p>
          </div>
          <IconButton
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            icon={
              theme === "light" ? (
                <Moon aria-hidden="true" className="size-4" />
              ) : (
                <Sun aria-hidden="true" className="size-4" />
              )
            }
            onClick={toggleTheme}
            shape="circle"
            size="lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {swatches.map((swatch) => (
            <div key={swatch.label}>
              <div
                className={`aspect-square rounded-sm border border-hairline ${swatch.className}`}
              />
              <p className="mt-2 font-mono text-[10px] tracking-[0.05em] text-body uppercase">
                {swatch.label}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-sm border border-hairline bg-surface p-6">
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Display / Mono
          </p>
          <p className="mt-4 text-4xl leading-tight font-medium tracking-[-0.03em]">
            Compensation deserves clarity.
          </p>
          <p className="mt-4 max-w-xl text-base leading-6 text-body">
            Narrative type stays calm and direct. Technical labels use mono, uppercase, and positive
            tracking.
          </p>
        </div>
      </div>
    </ShowcaseSection>
  );
};

export default FoundationsSection;
