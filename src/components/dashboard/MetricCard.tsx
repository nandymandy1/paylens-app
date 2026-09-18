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
        <p className="font-mono text-[10px] font-medium tracking-[0.09em] text-body uppercase">
          {label}
        </p>
        {icon && <span className="text-body">{icon}</span>}
      </div>
      <p className="mt-6 text-3xl font-medium tracking-tight">{value}</p>
      {description && <p className="mt-2 text-sm leading-5 text-body">{description}</p>}
    </Card.Content>
  </Card>
);

export default MetricCard;
