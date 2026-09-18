import type { FC, ReactNode } from "react";

type DashboardPageHeaderProps = {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

const DashboardPageHeader: FC<DashboardPageHeaderProps> = ({
  actions,
  description,
  eyebrow,
  title,
}) => (
  <header className="dashboard-page-enter flex w-full flex-wrap items-end justify-between gap-4">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="font-mono text-[11px] font-medium tracking-[0.09em] text-body uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 text-base leading-6 text-body">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </header>
);

export default DashboardPageHeader;
