import type { FC } from "react";
import cn from "@/utils/cn";
import Image from "next/image";

type PayLensLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  theme?: "auto" | "light" | "dark";
  variant?: "full" | "compact" | "mark";
};

const sizes = { sm: "h-6", md: "h-8", lg: "h-11" };

const PayLensLogo: FC<PayLensLogoProps> = ({
  className,
  size = "md",
  theme = "auto",
  variant = "full",
}) => {
  if (variant === "mark") {
    return (
      <Image
        alt="PayLens"
        className={cn(sizes[size], "w-auto", className)}
        height={64}
        src="/brand/paylens-mark.svg"
        width={64}
      />
    );
  }

  const asset = variant === "compact" ? "paylens-logo-compact" : "paylens-logo";
  const light = `/brand/${asset}-light.svg`;
  const dark = `/brand/${asset}-dark.svg`;

  if (theme !== "auto") {
    return (
      <Image
        alt="PayLens"
        className={cn(sizes[size], "w-auto", className)}
        height={64}
        src={theme === "dark" ? dark : light}
        width={240}
      />
    );
  }

  return (
    <span
      aria-label="PayLens"
      className={cn("paylens-logo-auto inline-flex", className)}
      role="img"
    >
      <Image
        alt=""
        className={cn(sizes[size], "paylens-logo-light w-auto")}
        height={64}
        src={light}
        width={240}
      />
      <Image
        alt=""
        className={cn(sizes[size], "paylens-logo-dark hidden w-auto")}
        height={64}
        src={dark}
        width={240}
      />
    </span>
  );
};

export default PayLensLogo;
