"use client";

import type { FC, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import cn from "@/utils/cn";

export type AccordionItem = {
  content: ReactNode;
  disabled?: boolean;
  title: ReactNode;
  value: string;
};

type AccordionProps = {
  className?: string;
  defaultValue?: string | string[];
  items: AccordionItem[];
  onValueChange?: (value: string | string[]) => void;
  type?: "single" | "multiple";
  value?: string | string[];
};

const Accordion: FC<AccordionProps> = ({
  className,
  defaultValue,
  items,
  onValueChange,
  type = "single",
  value,
}) => {
  const content = items.map((item) => (
    <AccordionPrimitive.Item
      className="border-b border-hairline last:border-b-0"
      disabled={item.disabled}
      key={item.value}
      value={item.value}
    >
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-45">
          <span>{item.title}</span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden text-sm leading-6 text-body data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
        <div className="pb-4 pr-8">{item.content}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  ));

  if (type === "multiple") {
    return (
      <AccordionPrimitive.Root
        className={cn(
          "rounded-sm border border-hairline bg-surface px-4",
          className,
        )}
        defaultValue={Array.isArray(defaultValue) ? defaultValue : undefined}
        onValueChange={onValueChange as ((value: string[]) => void) | undefined}
        type="multiple"
        value={Array.isArray(value) ? value : undefined}
      >
        {content}
      </AccordionPrimitive.Root>
    );
  }

  return (
    <AccordionPrimitive.Root
      className={cn(
        "rounded-sm border border-hairline bg-surface px-4",
        className,
      )}
      collapsible
      defaultValue={typeof defaultValue === "string" ? defaultValue : undefined}
      onValueChange={onValueChange as ((value: string) => void) | undefined}
      type="single"
      value={typeof value === "string" ? value : undefined}
    >
      {content}
    </AccordionPrimitive.Root>
  );
};

export default Accordion;
