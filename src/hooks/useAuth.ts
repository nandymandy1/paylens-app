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
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/types/auth.type";

export const useMe = () => useQuery({ queryKey: authKeys.me(), queryFn: fetchMe });

export const useProviders = () =>
  useQuery({ queryKey: authKeys.providers(), queryFn: fetchProviders });

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: async () => {
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

  return useMutation({
    mutationFn: () => logout(),
    onSettled: async () => {
      queryClient.removeQueries({ queryKey: authKeys.me() });
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
