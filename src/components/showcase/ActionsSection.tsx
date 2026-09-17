import type { FC } from "react";
import { ArrowRight, Download, Plus, Settings } from "lucide-react";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import ShowcaseSection from "./ShowcaseSection";

const ActionsSection: FC = () => {
  return (
    <ShowcaseSection
      description="Buttons use the canonical mono label treatment, explicit hierarchy, and visible keyboard focus."
      eyebrow="02 / Actions"
      id="actions"
      title="Actions with a clear hierarchy"
    >
      <div className="space-y-8">
        <div>
          <h3 className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Variants
          </h3>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="mint">Mint</Button>
            <Button variant="white">White</Button>
            <Button variant="outline">Outline</Button>
            <div className="rounded-sm bg-canvas-dark p-2">
              <Button variant="ghost">On dark</Button>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Sizes and states
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra large</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Saving</Button>
          </div>
        </div>
        <div>
          <h3 className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Icon composition
          </h3>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button prefixIcon={<Plus aria-hidden="true" className="size-4" />}>
              Add employee
            </Button>
            <Button
              suffixIcon={<ArrowRight aria-hidden="true" className="size-4" />}
              variant="outline"
            >
              Review changes
            </Button>
            <Button
              prefixIcon={<Download aria-hidden="true" className="size-4" />}
              suffixIcon={<ArrowRight aria-hidden="true" className="size-4" />}
              variant="mint"
            >
              Export report
            </Button>
          </div>
          <Button block className="mt-3" variant="outline">
            Full-width action
          </Button>
        </div>
        <div>
          <h3 className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Icon buttons
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {(["sm", "md", "lg", "xl"] as const).map((size) => (
              <IconButton
                aria-label={`Settings, ${size} size`}
                icon={<Settings aria-hidden="true" className="size-4" />}
                key={size}
                size={size}
                variant="outline"
              />
            ))}
            <IconButton
              aria-label="Circular settings"
              icon={<Settings aria-hidden="true" className="size-4" />}
              shape="circle"
            />
            <IconButton
              aria-label="Loading settings"
              icon={<Settings aria-hidden="true" className="size-4" />}
              loading
            />
            <IconButton
              aria-label="Disabled settings"
              disabled
              icon={<Settings aria-hidden="true" className="size-4" />}
            />
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
};

export default ActionsSection;
