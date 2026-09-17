import { beforeEach, describe, expect, it } from "vitest";
import useThemeStore, { THEME_STORAGE_KEY } from "@/stores/theme";

describe("theme store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useThemeStore.setState({ theme: "light" });
    document.documentElement.dataset.theme = "light";
  });

  it("persists and applies the selected theme", () => {
    useThemeStore.getState().setTheme("dark");

    expect(useThemeStore.getState().theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toContain(
      '"theme":"dark"',
    );
  });
});
