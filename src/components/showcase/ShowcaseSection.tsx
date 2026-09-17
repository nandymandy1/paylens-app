import type { FC, PropsWithChildren } from "react";

type ShowcaseSectionProps = PropsWithChildren<{
  description: string;
  eyebrow: string;
  id: string;
  title: string;
}>;

const ShowcaseSection: FC<ShowcaseSectionProps> = ({
  children,
  description,
  eyebrow,
  id,
  title,
}) => {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="border-t border-hairline py-12 sm:py-16"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-12">
        <header>
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            {eyebrow}
          </p>
          <h2
            className="mt-3 text-3xl leading-tight font-medium tracking-[-0.02em]"
            id={`${id}-title`}
          >
            {title}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-body">{description}</p>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
