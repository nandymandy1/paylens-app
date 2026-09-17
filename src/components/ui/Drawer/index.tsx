"use client";

import type { FC, ReactElement, ReactNode } from "react";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import cn from "@/utils/cn";

type DrawerDirection = "left" | "right" | "top" | "bottom";
type DrawerProps = {
  children: ReactNode;
  closeOnOutsideInteraction?: boolean;
  defaultOpen?: boolean;
  description?: ReactNode;
  direction?: DrawerDirection;
  footer?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title: ReactNode;
  trigger?: ReactElement;
};

const directionClasses: Record<DrawerDirection, string> = {
  left: "inset-y-0 left-0 w-[min(100%-2rem,28rem)] border-r",
  right: "inset-y-0 right-0 w-[min(100%-2rem,28rem)] border-l",
  top: "top-0 inset-x-0 max-h-[min(100%-2rem,28rem)] border-b",
  bottom: "bottom-0 inset-x-0 max-h-[min(100%-2rem,28rem)] border-t",
};
const Drawer: FC<DrawerProps> = ({
  children,
  closeOnOutsideInteraction = true,
  defaultOpen,
  description,
  direction = "right",
  footer,
  onOpenChange,
  open,
  title,
  trigger,
}) => {
  return (
    <DialogPrimitive.Root defaultOpen={defaultOpen} onOpenChange={onOpenChange} open={open}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-canvas-dark/55 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in motion-reduce:animate-none" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-[60] flex overflow-y-auto border-hairline bg-surface p-6 text-ink shadow-soft outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in motion-reduce:animate-none",
            directionClasses[direction],
          )}
          onInteractOutside={(event) => {
            if (!closeOnOutsideInteraction) event.preventDefault();
          }}
        >
          <div className="flex min-h-full w-full flex-col">
            <div className="pr-9">
              <DialogPrimitive.Title className="text-xl font-medium tracking-[-0.02em]">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-body">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <div className="flex-1 py-6 text-sm leading-6 text-body">{children}</div>
            {footer && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-hairline pt-5">
                {footer}
              </div>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Close drawer"
            className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-sm text-body outline-none hover:bg-surface-subtle hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X aria-hidden="true" className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Drawer;
