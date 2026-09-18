import { beforeEach, describe, expect, it } from "vitest";
import useAuthSessionStore, { mayAttemptRefresh } from "@/stores/auth-session";

describe("auth session lifecycle", () => {
  beforeEach(() => {
    useAuthSessionStore.getState().resetForTests();
  });

  it("starts unknown with refresh allowed for bootstrap", () => {
    expect(useAuthSessionStore.getState().status).toBe("unknown");
    expect(mayAttemptRefresh()).toBe(true);
  });

  it("keeps refresh available for live authenticated sessions", () => {
    useAuthSessionStore.getState().markAuthenticated();

    expect(mayAttemptRefresh()).toBe(true);
  });

  it("blocks refresh while logging-out and when known anonymous", () => {
    useAuthSessionStore.getState().markAuthenticated();
    useAuthSessionStore.getState().beginLogout();

    expect(useAuthSessionStore.getState().status).toBe("logging-out");
    expect(mayAttemptRefresh()).toBe(false);

    useAuthSessionStore.getState().endLogout();

    expect(useAuthSessionStore.getState().status).toBe("anonymous");
    expect(mayAttemptRefresh()).toBe(false);
  });

  it("bumps the generation on every logout transition", () => {
    const start = useAuthSessionStore.getState().generation;

    useAuthSessionStore.getState().markAuthenticated();
    useAuthSessionStore.getState().beginLogout();

    const during = useAuthSessionStore.getState().generation;

    expect(during).toBeGreaterThan(start);

    useAuthSessionStore.getState().endLogout();

    expect(useAuthSessionStore.getState().generation).toBeGreaterThan(during);
  });
});
