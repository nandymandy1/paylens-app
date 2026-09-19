"use client";

import { useState, type FC } from "react";
import Image from "next/image";
import cn from "@/utils/cn";

type AvatarSize = "sm" | "md" | "lg" | number;
type AvatarShape = "circle" | "square";
type AvatarProps = {
  alt: string;
  className?: string;
  fallback: string;
  shape?: AvatarShape;
  size?: AvatarSize;
  src?: string;
};

const sizeClasses: Record<Exclude<AvatarSize, number>, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};
const sizePixels: Record<Exclude<AvatarSize, number>, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};
const Avatar: FC<AvatarProps> = ({
  alt,
  className,
  fallback,
  shape = "circle",
  size = "md",
  src,
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const pixels = typeof size === "number" ? size : sizePixels[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-hairline/50 bg-accent-mint font-mono font-medium text-black uppercase ring-2 ring-surface",
        typeof size === "number" ? undefined : sizeClasses[size],
        shape === "circle" ? "rounded-full" : "rounded-md",
        className,
      )}
      style={typeof size === "number" ? { height: pixels, width: pixels } : undefined}
    >
      {src && src !== failedSrc ? (
        <Image
          alt={alt}
          className="size-full object-cover"
          height={pixels}
          onError={() => setFailedSrc(src)}
          src={src}
          unoptimized
          width={pixels}
        />
      ) : (
        <span aria-label={alt}>{fallback.slice(0, 2)}</span>
      )}
    </span>
  );
};

export default Avatar;
