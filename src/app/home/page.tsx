"use client";

import type { FC } from "react";
import useThemeStore from "@/stores/theme";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import HeroSection from "@/components/landing/HeroSection";
import PrinciplesRibbon from "@/components/landing/PrinciplesRibbon";
import FeatureGrid from "@/components/landing/FeatureGrid";
import CompensationStory from "@/components/landing/CompensationStory";
import SecurityStory from "@/components/landing/SecurityStory";
import WorkflowSection from "@/components/landing/WorkflowSection";
import FinalCTA from "@/components/landing/FinalCTA";
import cn from "@/utils/cn";

const HomePage: FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        isDark ? "bg-[#06061a] text-white" : "bg-[#f4f3f8] text-[#0a0a1a]",
      )}
    >
      <LandingNav />
      <div className="flex-1">
        <main>
          <HeroSection />
          <PrinciplesRibbon />
          <FeatureGrid />
          <CompensationStory />
          <SecurityStory />
          <WorkflowSection />
          <FinalCTA />
        </main>
      </div>
      <LandingFooter />
    </div>
  );
};

export default HomePage;
