import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("axios", async (importOriginal) => {
  const original = await importOriginal<typeof import("axios")>();

  return {
    ...original,
    default: {
      ...original.default,
      create: vi.fn(() => ({
        interceptors: { response: { use: vi.fn() } },
      })),
      post: vi.fn(),
    },
  };
});

describe("api base URL contract", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("fails fast in production without an explicit API URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    await expect(import("@/services/api")).rejects.toThrow("NEXT_PUBLIC_API_BASE_URL is required");
  });

  it("uses the explicit URL in production and falls back locally", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.paylens.example/api/v1");

    const production = await import("@/services/api");

    expect(production.API_BASE_URL).toBe("https://api.paylens.example/api/v1");

    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    const development = await import("@/services/api");

    expect(development.API_BASE_URL).toBe("http://localhost:4000/api/v1");
  });
});
