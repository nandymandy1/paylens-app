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
    <div className="max-w-2xl page-header-accent">
      {eyebrow && (
        <p className="font-mono text-[10px] font-medium tracking-[0.09em] text-body/60 uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-2xl font-medium tracking-tight text-ink sm:text-3xl">{title}</h1>
      {description && <p className="mt-2.5 text-sm leading-6 text-body">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </header>
);

export default DashboardPageHeader;
