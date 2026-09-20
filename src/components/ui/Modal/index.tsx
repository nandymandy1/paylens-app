"use client";

import type { FC, PropsWithChildren, ReactElement, ReactNode } from "react";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import cn from "@/utils/cn";

type ModalSize = "sm" | "md" | "lg" | "xl";
type ModalProps = PropsWithChildren<{
  closeOnOutsideInteraction?: boolean;
  defaultOpen?: boolean;
  description?: ReactNode;
  footer?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  size?: ModalSize;
  title: ReactNode;
  trigger?: ReactElement;
}>;

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};
const Modal: FC<ModalProps> = ({
  children,
  closeOnOutsideInteraction = true,
  defaultOpen,
  description,
  footer,
  onOpenChange,
  open,
  size = "md",
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
            "fixed top-1/2 left-1/2 z-[60] grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-md border border-hairline bg-surface p-6 text-ink shadow-modal outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in motion-reduce:animate-none",
            sizeClasses[size],
          )}
          onInteractOutside={(event) => {
            if (!closeOnOutsideInteraction) event.preventDefault();
          }}
        >
          <div className="pr-9">
            <DialogPrimitive.Title className="text-lg font-medium tracking-[-0.01em] text-ink">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="mt-1.5 text-sm leading-6 text-body">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <div className="text-sm leading-6 text-body px-1">{children}</div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-3 border-t border-hairline pt-5">
              {footer}
            </div>
          )}
          <DialogPrimitive.Close
            aria-label="Close dialog"
            className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-sm text-body outline-none hover:bg-surface-subtle hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X aria-hidden="true" className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Modal;
