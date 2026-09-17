import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const SIDEBAR_STORAGE_KEY = "paylens-sidebar";

type SidebarState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: SIDEBAR_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }),
    },
  ),
);

export default useSidebarStore;
