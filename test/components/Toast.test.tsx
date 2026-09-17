import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { toast } from "sonner";
import AppProviders from "@/components/providers/AppProviders";
import { showToast } from "@/events/toast";
import useThemeStore from "@/stores/theme";

const renderToastSystem = () => render(<AppProviders>Content</AppProviders>);

afterEach(() => {
  toast.dismiss();
  useThemeStore.setState({ theme: "light" });
});

describe("global toast system", () => {
  it("syncs Sonner with the persisted theme and exposes an accessible close control", async () => {
    renderToastSystem();

    act(() => {
      showToast({
        description: "The update is available to review.",
        title: "Saved",
        tone: "success",
      });
    });

    const toastTitle = await screen.findByText("Saved");
    const toastElement = toastTitle.closest("[data-sonner-toast]");
    const toaster = toastTitle.closest<HTMLElement>("[data-sonner-toaster]");

    expect(toastElement?.className).toContain("bg-success-soft");
    expect(toaster?.dataset.sonnerTheme).toBe("light");
    expect(
      screen.getByRole("button", { name: "Close notification" }),
    ).toBeDefined();

    act(() => {
      useThemeStore.getState().setTheme("dark");
    });

    expect(toaster?.dataset.sonnerTheme).toBe("dark");
  });

  it.each(["error", "warning", "info"] as const)(
    "renders the %s variant through the Mitt bridge",
    async (tone) => {
      renderToastSystem();

      act(() => {
        showToast({ title: `${tone} feedback`, tone });
      });

      const toastTitle = await screen.findByText(`${tone} feedback`);
      expect(toastTitle.closest("[data-sonner-toast]")?.className).toContain(
        `bg-${tone === "error" ? "danger" : tone}-soft`,
      );
    },
  );
});
