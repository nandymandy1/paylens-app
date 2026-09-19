import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  authKeys,
  fetchMe,
  fetchProviders,
  forgotPassword,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  switchOrganization,
  verifyEmail,
} from "@/services/auth.service";
import { ApiError } from "@/services/api";
import useAuthSessionStore, { getAuthSessionGeneration } from "@/stores/auth-session";
import { AUTH_ROUTES } from "@/utils/routes";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/types/auth.type";

/** Resolves the server-owned session truth and applies the canonical auth state. */
export const reconcileAuthMe = async () => {
  const generation = getAuthSessionGeneration();

  try {
    const me = await fetchMe();

    // A stale response arriving after logout must not restore user/organization
    // state or authenticated guards.
    if (generation !== getAuthSessionGeneration()) {
      throw new Error("auth reconciliation superseded by logout");
    }

    useAuthSessionStore.getState().markAuthenticated();

    return me;
  } catch (error) {
    // A response superseded by explicit logout is not an authentication failure
    // and must not overwrite the logout lifecycle state.
    if (generation === getAuthSessionGeneration()) {
      if (error instanceof ApiError && error.status === 401) {
        useAuthSessionStore.getState().markAnonymous();
      } else {
        useAuthSessionStore.getState().markAuthError();
      }
    }

    throw error;
  }
};

export const useMe = (options: { enabled?: boolean } = {}) => {
  const status = useAuthSessionStore((state) => state.status);

  // Known anonymous sessions (post-logout) and logout itself must never probe
  // /auth/me: the outcome is already known and a 401 probe would only invite a
  // pointless refresh attempt. Unknown bootstrap and live sessions may probe.
  const enabled = options.enabled ?? (status === "unknown" || status === "authenticated");

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: reconcileAuthMe,
    enabled,
  });
};

export const useProviders = () =>
  useQuery({ queryKey: authKeys.providers(), queryFn: fetchProviders });

export const useLogin = () => {
  const queryClient = useQueryClient();
  const markAuthenticated = useAuthSessionStore((state) => state.markAuthenticated);

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: async () => {
      markAuthenticated();
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

export const useRegister = () =>
  useMutation({ mutationFn: (input: RegisterInput) => register(input) });

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  const markUnknown = useAuthSessionStore((state) => state.markUnknown);

  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: async () => {
      // Backend verification creates a browser session: reconcile the
      // frontend lifecycle explicitly. A disabled anonymous probe would
      // never refetch, so fetch + seed auth/me before dashboard renders.
      markUnknown();

      try {
        const me = await queryClient.fetchQuery({
          queryKey: authKeys.me(),
          queryFn: reconcileAuthMe,
        });

        queryClient.setQueryData(authKeys.me(), me);
      } catch {}
    },
  });
};

export const useResendVerification = () =>
  useMutation({ mutationFn: (email: string) => resendVerification(email) });

export const useForgotPassword = () =>
  useMutation({ mutationFn: (input: ForgotPasswordInput) => forgotPassword(input) });

export const useResetPassword = () =>
  useMutation({ mutationFn: (input: ResetPasswordInput) => resetPassword(input) });

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const beginLogout = useAuthSessionStore((state) => state.beginLogout);
  const endLogout = useAuthSessionStore((state) => state.endLogout);
  const markUnknown = useAuthSessionStore((state) => state.markUnknown);

  return useMutation({
    mutationFn: () => logout(),
    onMutate: async () => {
      // Enter logging-out first so the interceptor and /auth/me gating stop
      // new refresh/probe work, then cancel any in-flight /auth/me.
      beginLogout();
      await queryClient.cancelQueries({ queryKey: authKeys.me() });
    },
    onSuccess: async () => {
      // Server revoked the session: safe to claim anonymous and drop all
      // tenant-owned query state. Auth (non-tenant) caches stay intact.
      queryClient.removeQueries({ queryKey: ["organizations"] });
      queryClient.removeQueries({ queryKey: ["employees"] });
      queryClient.removeQueries({ queryKey: ["departments"] });
      queryClient.removeQueries({ queryKey: authKeys.me() });
      endLogout();
      router.push(AUTH_ROUTES.login);
    },
    onError: async () => {
      // Ambiguous: the server session may still exist. Return to unknown so
      // /auth/me re-resolves server truth instead of falsely claiming logout.
      markUnknown();
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

export const useSwitchOrganization = () => {
  const queryClient = useQueryClient();
  const markUnknown = useAuthSessionStore((state) => state.markUnknown);

  return useMutation({
    mutationFn: (organizationId: string) => switchOrganization(organizationId),
    onMutate: async () => {
      // Capture outgoing tenant state before the switch lands.
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      await queryClient.cancelQueries({ queryKey: ["departments"] });
    },
    onSuccess: async () => {
      // Drop the previous tenant's visible query state so Org-A rows never
      // render under the Org-B shell, then re-resolve canonical auth/me.
      const previousOrgId = queryClient.getQueryData<{ activeOrganization?: { id?: string } }>(
        authKeys.me(),
      )?.activeOrganization?.id;

      if (previousOrgId) {
        queryClient.removeQueries({ queryKey: ["organizations", previousOrgId] });
        queryClient.removeQueries({ queryKey: ["employees", previousOrgId] });
        queryClient.removeQueries({ queryKey: ["departments", previousOrgId] });
      }

      // The server session has switched, so cached Org-A auth data is no
      // longer trustworthy. Remove it before fetching the authoritative Org-B
      // session; protected screens stay blocked until this resolves.
      markUnknown();
      queryClient.removeQueries({ queryKey: authKeys.me() });
      await queryClient.fetchQuery({ queryKey: authKeys.me(), queryFn: reconcileAuthMe });
    },
  });
};
