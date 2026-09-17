import { beforeEach, describe, expect, it } from "vitest";
import useSidebarStore, { SIDEBAR_STORAGE_KEY } from "@/stores/sidebar";

describe("sidebar store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSidebarStore.setState({ sidebarCollapsed: false });
  });

  it("persists collapse state as non-sensitive UI state", () => {
    useSidebarStore.getState().toggleSidebar();

    expect(useSidebarStore.getState().sidebarCollapsed).toBe(true);
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toContain('"sidebarCollapsed":true');

    useSidebarStore.getState().setSidebarCollapsed(false);

    expect(useSidebarStore.getState().sidebarCollapsed).toBe(false);
  });
});
