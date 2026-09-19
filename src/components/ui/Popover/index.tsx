"use client";

import type { FC, ReactElement, ReactNode } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import cn from "@/utils/cn";

type PopoverProps = {
  align?: "start" | "center" | "end";
  children: ReactElement;
  className?: string;
  content: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  side?: "top" | "right" | "bottom" | "left";
};

const Popover: FC<PopoverProps> = ({
  align = "center",
  children,
  className,
  content,
  onOpenChange,
  open,
  side = "bottom",
}) => {
  return (
    <PopoverPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          className={cn(
            "z-50 w-72 rounded-md border border-hairline bg-surface p-4 text-sm text-ink shadow-elevated outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
            className,
          )}
          side={side}
          sideOffset={8}
        >
          {content}
          <PopoverPrimitive.Arrow className="fill-surface stroke-hairline" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export default Popover;
