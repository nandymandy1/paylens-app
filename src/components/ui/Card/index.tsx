import type { FC, PropsWithChildren } from "react";
import cn from "@/utils/cn";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

type CardSectionProps = PropsWithChildren<{
  className?: string;
}>;

type CardComponent = FC<CardProps> & {
  Content: FC<CardSectionProps>;
  Footer: FC<CardSectionProps>;
  Header: FC<CardSectionProps>;
};

const CardRoot: FC<CardProps> = ({ children, className }) => (
  <article
    className={cn(
      "overflow-hidden rounded-sm border border-hairline bg-surface text-ink",
      className,
    )}
  >
    {children}
  </article>
);

const CardHeader: FC<CardSectionProps> = ({ children, className }) => (
  <header className={cn("border-b border-hairline p-6", className)}>
    {children}
  </header>
);

const CardContent: FC<CardSectionProps> = ({ children, className }) => (
  <div className={cn("p-6", className)}>{children}</div>
);

const CardFooter: FC<CardSectionProps> = ({ children, className }) => (
  <footer
    className={cn("border-t border-hairline bg-canvas-soft p-6", className)}
  >
    {children}
  </footer>
);

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
}) as CardComponent;

export default Card;
