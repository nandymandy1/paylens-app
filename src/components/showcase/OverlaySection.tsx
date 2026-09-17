"use client";

import type { FC } from "react";
import { HelpCircle, MoreHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Popover from "@/components/ui/Popover";
import Tooltip from "@/components/ui/Tooltip";
import ShowcaseSection from "./ShowcaseSection";

const OverlaySection: FC = () => {
  return (
    <ShowcaseSection
      id="overlay"
      eyebrow="05 / Overlay"
      description="Radix supplies positioning, focus, and keyboard behavior while PayLens supplies the visual contract."
      title="Context, close to the control"
    >
      <div className="flex flex-wrap items-center gap-4 rounded-sm border border-hairline bg-surface p-6">
        <Tooltip content="Compensation data is visible only to authorized roles.">
          <IconButton
            aria-label="Explain compensation visibility"
            icon={<HelpCircle aria-hidden="true" className="size-4" />}
            shape="circle"
            variant="outline"
          />
        </Tooltip>
        <Popover
          align="start"
          content={
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
                Review actions
              </p>
              <p className="mt-2 leading-5 text-body">
                Popovers hold concise, contextual controls without replacing a full workflow.
              </p>
              <Button className="mt-4" size="sm">
                Open review
              </Button>
            </div>
          }
        >
          <Button
            prefixIcon={<MoreHorizontal aria-hidden="true" className="size-4" />}
            variant="outline"
          >
            Open popover
          </Button>
        </Popover>
      </div>
    </ShowcaseSection>
  );
};

export default OverlaySection;
