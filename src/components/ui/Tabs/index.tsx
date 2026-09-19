"use client";

import type { FC, ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import cn from "@/utils/cn";

export type TabItem = {
  content: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  value: string;
};

type TabsProps = {
  className?: string;
  defaultValue?: string;
  items: TabItem[];
  onValueChange?: (value: string) => void;
  value?: string;
};

const Tabs: FC<TabsProps> = ({ className, defaultValue, items, onValueChange, value }) => {
  return (
    <TabsPrimitive.Root
      className={cn("w-full", className)}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      value={value}
    >
      <TabsPrimitive.List
        aria-label="Content sections"
        className="flex w-full gap-1 overflow-x-auto border-b border-hairline"
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            className="inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm text-body outline-none transition-[border-color,color] duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset data-[state=active]:border-brand-magenta data-[state=active]:font-medium data-[state=active]:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            disabled={item.disabled}
            key={item.value}
            value={item.value}
          >
            {item.prefixIcon}
            <span>{item.label}</span>
            {item.suffixIcon}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content
          className="pt-5 text-sm leading-6 text-body outline-none focus-visible:ring-2 focus-visible:ring-focus"
          key={item.value}
          value={item.value}
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
};

export default Tabs;
