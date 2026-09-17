import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

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
    refreshPromise = (async () => {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          withCredentials: true,
          timeout: 15_000,
        });

        if (!data?.data?.refreshed) {
          throw new Error("refresh rejected");
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
    if (
      status === 401 &&
      original &&
      !original._retried &&
      !isAuthEndpoint(original.url) &&
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
