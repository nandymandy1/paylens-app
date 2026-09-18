import { create } from "zustand";

export type AuthSessionStatus =
  "unknown" | "authenticated" | "anonymous" | "auth-error" | "logging-out";

type AuthSessionState = {
  status: AuthSessionStatus;
  /** Bumped on every logout transition so late refresh/auth responses can be discarded. */
  generation: number;
  markAuthenticated: () => void;
  markAnonymous: () => void;
  markAuthError: () => void;
  markUnknown: () => void;
  beginLogout: () => void;
  endLogout: () => void;
  resetForTests: () => void;
};

/**
 * Explicit logout lifecycle.
 *
 * unknown → bootstrap probe (/auth/me, refresh when appropriate) →
 * authenticated ⇄ anonymous. Explicit logout moves authenticated →
 * logging-out → known anonymous without refetching /auth/me or refreshing.
 * Logout wins over any in-flight refresh/auth bootstrap: a late response
 * carrying a stale generation must never restore authentication.
 */
const useAuthSessionStore = create<AuthSessionState>((set) => ({
  status: "unknown",
  generation: 0,
  markAuthenticated: () => {
    set({ status: "authenticated" });
  },
  markAnonymous: () => {
    set({ status: "anonymous" });
  },
  markAuthError: () => {
    set({ status: "auth-error" });
  },
  markUnknown: () => {
    set((state) => ({ status: "unknown", generation: state.generation + 1 }));
  },
  beginLogout: () => {
    set((state) => ({ status: "logging-out", generation: state.generation + 1 }));
  },
  endLogout: () => {
    set((state) => ({ status: "anonymous", generation: state.generation + 1 }));
  },
  resetForTests: () => {
    set({ status: "unknown", generation: 0 });
  },
}));

export const getAuthSessionStatus = (): AuthSessionStatus => useAuthSessionStore.getState().status;

export const getAuthSessionGeneration = (): number => useAuthSessionStore.getState().generation;

/** Refresh is only legitimate for unknown bootstrap or live authenticated sessions. */
export const mayAttemptRefresh = (): boolean => {
  const status = getAuthSessionStatus();

  return status === "unknown" || status === "authenticated";
};

export default useAuthSessionStore;
