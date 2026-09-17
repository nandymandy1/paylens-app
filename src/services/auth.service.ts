import api, { API_BASE_URL } from "@/services/api";
import type {
  ForgotPasswordInput,
  InvitationPreview,
  InviteAcceptNewUserInput,
  LoginInput,
  MeResponse,
  MembershipSummary,
  RegisterInput,
  ResetPasswordInput,
  SafeUser,
} from "@/types/auth.type";

type Envelope<T> = { success: true; data: T; requestId?: string };

export const authKeys = {
  me: () => ["auth", "me"] as const,
  providers: () => ["auth", "providers"] as const,
  invitationPreview: (token: string) => ["auth", "invitation", token] as const,
};

export const fetchMe = async (): Promise<MeResponse> => {
  const { data } = await api.get<Envelope<MeResponse>>("/auth/me");

  return data.data;
};

export const fetchProviders = async (): Promise<{ google: boolean }> => {
  const { data } = await api.get<Envelope<{ google: boolean }>>("/auth/providers");

  return data.data;
};

export const login = async (
  input: LoginInput,
): Promise<{ user: SafeUser; memberships: MembershipSummary[] }> => {
  const { data } = await api.post<Envelope<{ user: SafeUser; memberships: MembershipSummary[] }>>(
    "/auth/login",
    input,
  );

  return data.data;
};

export const register = async (
  input: RegisterInput,
): Promise<{ user: SafeUser; organization: { id: string; name: string; slug: string } }> => {
  const { password, ...rest } = input;
  const { data } = await api.post<
    Envelope<{ user: SafeUser; organization: { id: string; name: string; slug: string } }>
  >("/auth/register", { ...rest, password });

  return data.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const verifyEmail = async (
  token: string,
): Promise<{ user: SafeUser; memberships: MembershipSummary[] }> => {
  const { data } = await api.post<Envelope<{ user: SafeUser; memberships: MembershipSummary[] }>>(
    "/auth/verify-email",
    { token },
  );

  return data.data;
};

export const resendVerification = async (email: string): Promise<string> => {
  const { data } = await api.post<Envelope<{ message: string }>>("/auth/resend-verification", {
    email,
  });

  return data.data.message;
};

export const forgotPassword = async (input: ForgotPasswordInput): Promise<string> => {
  const { data } = await api.post<Envelope<{ message: string }>>("/auth/forgot-password", input);

  return data.data.message;
};

export const resetPassword = async (input: ResetPasswordInput): Promise<string> => {
  const { data } = await api.post<Envelope<{ message: string }>>("/auth/reset-password", {
    token: input.token,
    password: input.password,
  });

  return data.data.message;
};

export const previewInvitation = async (token: string): Promise<InvitationPreview> => {
  const { data } = await api.get<Envelope<InvitationPreview>>("/auth/invitations/preview", {
    params: { token },
  });

  return data.data;
};

export const acceptInvitationNewUser = async (
  input: InviteAcceptNewUserInput,
): Promise<{ membershipId: string }> => {
  const { data } = await api.post<Envelope<{ membershipId: string }>>("/auth/invitations/accept", {
    token: input.token,
    firstName: input.firstName,
    lastName: input.lastName,
    password: input.password,
  });

  return data.data;
};

export const acceptInvitationAuthenticated = async (token: string): Promise<unknown> => {
  const { data } = await api.post<Envelope<unknown>>("/auth/invitations/accept", { token });

  return data.data;
};

export const switchOrganization = async (
  organizationId: string,
): Promise<{
  activeOrganization: { id: string; name: string; slug: string };
  activeMembership: { id: string; role: string; status: string };
}> => {
  const { data } = await api.post<
    Envelope<{
      activeOrganization: { id: string; name: string; slug: string };
      activeMembership: { id: string; role: string; status: string };
    }>
  >("/auth/switch-organization", {
    organizationId,
  });

  return data.data;
};

export const googleStartUrl = (
  options: { redirectTo?: string; invitationId?: string } = {},
): string => {
  const params = new URLSearchParams();

  if (options.redirectTo) {
    params.set("redirect_to", options.redirectTo);
  }

  if (options.invitationId) {
    params.set("invitationId", options.invitationId);
  }

  const query = params.toString();

  return `${API_BASE_URL}/auth/google/start${query ? `?${query}` : ""}`;
};
