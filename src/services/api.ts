import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getAuthSessionGeneration, mayAttemptRefresh } from "@/stores/auth-session";

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!configuredBaseUrl && process.env.NODE_ENV === "production") {
  // NEXT_PUBLIC_* values are inlined at build time: a production bundle built
  // without this variable would silently target localhost. Fail fast instead.
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is required in production (e.g. https://api.example.com/api/v1)",
  );
}

export const API_BASE_URL = configuredBaseUrl || "http://localhost:4000/api/v1";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verify-email",
];

const isAuthEndpoint = (url = ""): boolean =>
  AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

const toApiError = (error: AxiosError): ApiError => {
  const data = error.response?.data as
    { code?: string; message?: string; details?: unknown } | undefined;
  const status = error.response?.status ?? 0;

  return new ApiError(
    data?.code ?? (status === 0 ? "NETWORK_ERROR" : "UNKNOWN_ERROR"),
    data?.message ?? error.message,
    status,
    data?.details,
  );
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<void> | null = null;

const singleFlightRefresh = async (): Promise<void> => {
  if (!refreshPromise) {
    const generation = getAuthSessionGeneration();

    refreshPromise = (async () => {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          withCredentials: true,
          timeout: 15_000,
        });

        if (!data?.data?.refreshed) {
          throw new Error("refresh rejected");
        }

        // Logout wins over in-flight refresh: a logout that settled while
        // refresh was running bumps the generation. Never let the stale
        // refresh restore authentication or trigger an /auth/me retry.
        if (generation !== getAuthSessionGeneration() || !mayAttemptRefresh()) {
          throw new Error("refresh superseded by logout");
        }
      } finally {
        refreshPromise = null;
      }
    })();
  }

  await refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // Transport + refresh recovery only. Navigation decisions belong to auth
    // guards: an anonymous /auth/me probe must reject as anonymous state,
    // never redirect the browser. One retry maximum; 403 never refreshes.
    // Refresh stays available for unknown bootstrap and live authenticated
    // sessions, but never while logging-out or known anonymous after an
    // explicit logout.
    if (
      status === 401 &&
      original &&
      !original._retried &&
      !isAuthEndpoint(original.url) &&
      mayAttemptRefresh() &&
      typeof window !== "undefined"
    ) {
      original._retried = true;

      try {
        await singleFlightRefresh();

        return await api(original);
      } catch {
        // Fall through and reject with the normalized auth error.
      }
    }

    throw toApiError(error);
  },
);

export default api;
