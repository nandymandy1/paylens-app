import { beforeEach, describe, expect, it, vi } from "vitest";

type ErrorHandler = (error: {
  response?: { status?: number };
  config?: Record<string, unknown>;
}) => Promise<unknown>;

const handlers: { error?: ErrorHandler } = {};
const instanceMocks = {
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock("axios", async (importOriginal) => {
  const original = await importOriginal<typeof import("axios")>();

  return {
    ...original,
    default: {
      ...original.default,
      create: vi.fn(() =>
        Object.assign(
          vi.fn((config: unknown) => instanceMocks.post(config)),
          {
            get: instanceMocks.get,
            post: instanceMocks.post,
            interceptors: {
              response: {
                use: (_success: unknown, error: ErrorHandler) => {
                  handlers.error = error;
                },
              },
            },
          },
        ),
      ),
      post: vi.fn(),
    },
  };
});

const loadApi = async () => {
  vi.resetModules();

  return import("@/services/api");
};

describe("api refresh single-flight", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlers.error = undefined;
  });

  it("retries an expired request once after a single shared refresh", async () => {
    await loadApi();
    const axios = (await import("axios")).default as unknown as {
      post: ReturnType<typeof vi.fn>;
    };

    axios.post.mockResolvedValue({ data: { data: { refreshed: true } } });
    instanceMocks.post.mockResolvedValue({ ok: true });

    const first = handlers.error?.({
      response: { status: 401 },
      config: { url: "/organizations/current/members" },
    });
    const second = handlers.error?.({
      response: { status: 401 },
      config: { url: "/organizations/current/members" },
    });

    await expect(first).resolves.toEqual({ ok: true });
    await expect(second).resolves.toEqual({ ok: true });

    // Concurrent expiries share ONE refresh request.
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("treats anonymous /auth/me as plain auth state without navigating", async () => {
    await loadApi();
    const axios = (await import("axios")).default as unknown as {
      post: ReturnType<typeof vi.fn>;
    };

    axios.post.mockResolvedValue({ data: { data: { refreshed: false } } });

    await expect(
      handlers.error?.({ response: { status: 401 }, config: { url: "/auth/me" } }),
    ).rejects.toMatchObject({ status: 401 });

    // No browser navigation from the transport layer: guards decide.
    expect(window.location.href).toBe("http://localhost/");
  });

  it("skips refresh for /auth/me while logging-out or known anonymous", async () => {
    await loadApi();
    const axios = (await import("axios")).default as unknown as {
      post: ReturnType<typeof vi.fn>;
    };
    const store = (await import("@/stores/auth-session")).default;

    store.getState().markAuthenticated();
    store.getState().beginLogout();

    await expect(
      handlers.error?.({ response: { status: 401 }, config: { url: "/auth/me" } }),
    ).rejects.toMatchObject({ status: 401 });
    expect(axios.post).not.toHaveBeenCalled();

    store.getState().endLogout();

    await expect(
      handlers.error?.({ response: { status: 401 }, config: { url: "/auth/me" } }),
    ).rejects.toMatchObject({ status: 401 });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("still refreshes unknown bootstrap /auth/me probes", async () => {
    await loadApi();
    const axios = (await import("axios")).default as unknown as {
      post: ReturnType<typeof vi.fn>;
    };

    axios.post.mockResolvedValue({ data: { data: { refreshed: true } } });
    instanceMocks.post.mockResolvedValue({ ok: true });

    await expect(
      handlers.error?.({ response: { status: 401 }, config: { url: "/auth/me" } }),
    ).resolves.toEqual({ ok: true });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("lets logout win over an in-flight refresh", async () => {
    await loadApi();
    const axios = (await import("axios")).default as unknown as {
      post: ReturnType<typeof vi.fn>;
    };
    const store = (await import("@/stores/auth-session")).default;
    let resolveRefresh!: (value: unknown) => void;

    axios.post.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const pending = handlers.error?.({
      response: { status: 401 },
      config: { url: "/organizations/current/members" },
    });

    // The user logs out while refresh is still running.
    store.getState().markAuthenticated();
    store.getState().beginLogout();
    resolveRefresh({ data: { data: { refreshed: true } } });

    await expect(pending).rejects.toMatchObject({ status: 401 });
    // The stale refresh must not retry the original request.
    expect(instanceMocks.post).not.toHaveBeenCalled();
  });

  it("never refreshes on 403 and never retries twice", async () => {
    await loadApi();
    const axios = (await import("axios")).default as unknown as {
      post: ReturnType<typeof vi.fn>;
    };

    await expect(
      handlers.error?.({
        response: { status: 403 },
        config: { url: "/organizations/current/members" },
      }),
    ).rejects.toMatchObject({ code: "UNKNOWN_ERROR", status: 403 });
    await expect(
      handlers.error?.({
        response: { status: 401 },
        config: { url: "/x", _retried: true },
      }),
    ).rejects.toMatchObject({ status: 401 });

    expect(axios.post).not.toHaveBeenCalled();
  });
});
