"use client";

import { useEffect, type FC, type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import toastEvents, { type ToastPayload } from "@/events/toast";
import useThemeStore from "@/stores/theme";

type AppProvidersProps = PropsWithChildren;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
    },
  },
});

const notify = ({ tone, title, description }: ToastPayload) => {
  toast[tone](title, { description });
};
const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    toastEvents.on("show", notify);

    return () => {
      toastEvents.off("show", notify);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        closeButton
        theme={theme}
        position="bottom-right"
        toastOptions={{
          closeButtonAriaLabel: "Close notification",
          unstyled: true,
          classNames: {
            toast:
              "relative flex w-[356px] items-start gap-3 rounded-sm border px-4 py-3 font-sans text-sm shadow-soft",
            content: "flex min-w-0 flex-1 flex-col gap-0.5",
            title: "font-medium leading-5",
            description: "text-body leading-5",
            icon: "mt-0.5 flex size-4 shrink-0 items-center justify-center",
            closeButton:
              "absolute -top-2 -left-2 flex size-6 items-center justify-center rounded-full border border-hairline bg-surface text-body shadow-soft transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-focus/60 focus-visible:outline-none",
            default: "border-hairline bg-surface text-ink",
            success: "border-success bg-success-soft text-ink [&_[data-icon]]:text-success",
            error: "border-danger bg-danger-soft text-ink [&_[data-icon]]:text-danger",
            warning: "border-warning bg-warning-soft text-ink [&_[data-icon]]:text-warning",
            info: "border-info bg-info-soft text-ink [&_[data-icon]]:text-info",
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default AppProviders;
