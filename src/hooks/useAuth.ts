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
import useAuthSessionStore, { getAuthSessionGeneration } from "@/stores/auth-session";
import { organizationKeys } from "@/services/organization.service";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/types/auth.type";

export const useMe = (options: { enabled?: boolean } = {}) => {
  const status = useAuthSessionStore((state) => state.status);
  const markAuthenticated = useAuthSessionStore((state) => state.markAuthenticated);
  const markAnonymous = useAuthSessionStore((state) => state.markAnonymous);

  // Known anonymous sessions (post-logout) and logout itself must never probe
  // /auth/me: the outcome is already known and a 401 probe would only invite a
  // pointless refresh attempt. Unknown bootstrap and live sessions may probe.
  const enabled = options.enabled ?? (status === "unknown" || status === "authenticated");

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const generation = getAuthSessionGeneration();

      try {
        const me = await fetchMe();

        // A stale bootstrap response arriving after logout must not restore
        // user/organization state or authenticated guards.
        if (generation !== getAuthSessionGeneration()) {
          throw new Error("auth bootstrap superseded by logout");
        }

        markAuthenticated();

        return me;
      } catch (error) {
        // Logout wins: never flip a logging-out session back to anonymous
        // here; useLogout owns that transition. Unknown bootstrap failures
        // settle to known anonymous so /login stops probing.
        if (useAuthSessionStore.getState().status === "unknown") {
          markAnonymous();
        }

        throw error;
      }
    },
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

  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
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

  return useMutation({
    mutationFn: () => logout(),
    onMutate: async () => {
      // Enter logging-out first so the interceptor and /auth/me gating stop
      // new refresh/probe work, then cancel any in-flight /auth/me.
      beginLogout();
      await queryClient.cancelQueries({ queryKey: authKeys.me() });
    },
    onSettled: async () => {
      // Explicit logout discovers nothing new: remove (never invalidate)
      // the session query, drop tenant-scoped caches, mark known anonymous,
      // and navigate to login. No /auth/me refetch, no refresh attempt.
      queryClient.removeQueries({ queryKey: authKeys.me() });
      queryClient.removeQueries({ queryKey: organizationKeys.members() });
      queryClient.removeQueries({ queryKey: organizationKeys.invitations() });
      endLogout();
      router.push("/login");
    },
  });
};

export const useSwitchOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => switchOrganization(organizationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};
