"use client";

import type { FC, ReactElement, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import cn from "@/utils/cn";

type TooltipProps = {
  children: ReactElement;
  className?: string;
  content: ReactNode;
  delayDuration?: number;
  side?: "top" | "right" | "bottom" | "left";
};

const Tooltip: FC<TooltipProps> = ({
  children,
  className,
  content,
  delayDuration = 300,
  side = "top",
}) => {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={cn(
              "z-50 max-w-64 rounded-sm bg-canvas-dark px-3 py-2 text-xs leading-4 text-on-dark shadow-soft",
              "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=delayed-open]:fade-in",
              className,
            )}
            side={side}
            sideOffset={8}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-canvas-dark" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
