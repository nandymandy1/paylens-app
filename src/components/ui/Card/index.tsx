import type { FC, PropsWithChildren } from "react";
import cn from "@/utils/cn";

type CardProps = PropsWithChildren<{
  className?: string;
  variant?: "default" | "soft" | "interactive" | "highlight";
}>;
type CardSectionProps = PropsWithChildren<{
  className?: string;
}>;
type CardComponent = FC<CardProps> & {
  Content: FC<CardSectionProps>;
  Footer: FC<CardSectionProps>;
  Header: FC<CardSectionProps>;
};

const cardVariantClasses = {
  default: "bg-surface",
  soft: "bg-canvas-soft",
  interactive:
    "bg-surface transition-[background-color,border-color,transform] duration-150 ease-out hover:-translate-y-px hover:border-ink/20 hover:bg-canvas-soft",
  highlight:
    "relative bg-surface before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(120deg,#FC4C02_0%,#EF2CC1_40%,#BDBBFF_70%,#3455FF_100%)]",
};

const CardRoot: FC<CardProps> = ({ children, className, variant = "default" }) => (
  <article
    className={cn(
      "overflow-hidden rounded-sm border border-hairline text-ink",
      cardVariantClasses[variant],
      className,
    )}
  >
    {children}
  </article>
);
const CardHeader: FC<CardSectionProps> = ({ children, className }) => (
  <header className={cn("border-b border-hairline p-6", className)}>{children}</header>
);
const CardContent: FC<CardSectionProps> = ({ children, className }) => (
  <div className={cn("p-6", className)}>{children}</div>
);
const CardFooter: FC<CardSectionProps> = ({ children, className }) => (
  <footer className={cn("border-t border-hairline bg-canvas-soft p-6", className)}>
    {children}
  </footer>
);
const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
}) as CardComponent;

export default Card;
