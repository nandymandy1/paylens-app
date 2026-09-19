import type { FC, ReactNode } from "react";
import Card from "@/components/ui/Card";

type MetricCardProps = {
  description?: string;
  icon?: ReactNode;
  label: string;
  value: string;
};

const MetricCard: FC<MetricCardProps> = ({ description, icon, label, value }) => (
  <Card variant="highlight">
    <Card.Content className="p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[10px] font-medium tracking-[0.08em] text-body/60 uppercase">
          {label}
        </p>
        {icon && <span className="text-body/50">{icon}</span>}
      </div>
      <p className="mt-4 text-xl font-medium tracking-tight text-ink">{value}</p>
      {description && <p className="mt-1.5 text-xs leading-5 text-body">{description}</p>}
    </Card.Content>
  </Card>
);

export default MetricCard;
