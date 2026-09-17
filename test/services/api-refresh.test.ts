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
