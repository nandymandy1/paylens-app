import type { FC } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ShowcaseSection from "./ShowcaseSection";

const DataDisplaySection: FC = () => {
  return (
    <ShowcaseSection
      description="Compact semantic markers and composable surfaces keep employee and compensation information scannable."
      eyebrow="03 / Data display"
      id="data-display"
      title="Structure without visual noise"
    >
      <div className="space-y-8">
        <div>
          <h3 className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Badges
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="success">Active</Badge>
            <Badge variant="danger">Blocked</Badge>
            <Badge variant="warning">Review</Badge>
            <Badge variant="info">Pending</Badge>
            <Badge variant="primary">Primary</Badge>
          </div>
        </div>
        <div>
          <h3 className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Avatars
          </h3>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <Avatar alt="Avery Johnson" fallback="AJ" size="sm" />
            <Avatar alt="Avery Johnson" fallback="AJ" size="md" />
            <Avatar alt="Avery Johnson" fallback="AJ" size="lg" />
            <Avatar alt="Custom employee avatar" fallback="CE" size={60} />
            <Avatar
              alt="Image avatar example"
              fallback="IM"
              shape="square"
              size="lg"
              src="/globe.svg"
            />
            <Avatar
              alt="Fallback after image failure"
              fallback="FB"
              shape="square"
              src="/missing-avatar.png"
            />
          </div>
        </div>
        <Card>
          <Card.Header>
            <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
              Compensation review
            </p>
            <h3 className="mt-2 text-2xl font-medium tracking-[-0.02em]">
              Product engineering
            </h3>
          </Card.Header>
          <Card.Content>
            <p className="text-sm leading-6 text-body">
              Card slots keep header, content, and footer responsibilities
              explicit without a prop-heavy API.
            </p>
          </Card.Content>
          <Card.Footer>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-body">Updated today</span>
              <Badge variant="success">Ready</Badge>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </ShowcaseSection>
  );
};

export default DataDisplaySection;
