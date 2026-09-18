import api, { API_BASE_URL } from "@/services/api";
import type { BaseResponseWithData } from "@/types/api-response.types";
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
import type { Organization, OrganizationRole } from "@/types/organization.type";

export const authKeys = {
  me: () => ["auth", "me"] as const,
  providers: () => ["auth", "providers"] as const,
  invitationPreview: (token: string) => ["auth", "invitation", token] as const,
};

export const fetchMe = async (): Promise<MeResponse> => {
  const { data } = await api.get<BaseResponseWithData<MeResponse>>("/auth/me");

  return data.data;
};

export const fetchProviders = async (): Promise<{ google: boolean }> => {
  const { data } = await api.get<BaseResponseWithData<{ google: boolean }>>("/auth/providers");

  return data.data;
};

export const login = async (
  input: LoginInput,
): Promise<{ user: SafeUser; memberships: MembershipSummary[] }> => {
  const { data } = await api.post<
    BaseResponseWithData<{ user: SafeUser; memberships: MembershipSummary[] }>
  >("/auth/login", input);

  return data.data;
};

export const register = async (
  input: RegisterInput,
): Promise<{ user: SafeUser; organization: Organization }> => {
  const { password, confirmPassword, ...rest } = input;

  void confirmPassword;
  const { data } = await api.post<
    BaseResponseWithData<{ user: SafeUser; organization: Organization }>
  >("/auth/register", { ...rest, password });

  return data.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const verifyEmail = async (
  token: string,
): Promise<{ user: SafeUser; memberships: MembershipSummary[] }> => {
  const { data } = await api.post<
    BaseResponseWithData<{ user: SafeUser; memberships: MembershipSummary[] }>
  >("/auth/verify-email", { token });

  return data.data;
};

export const resendVerification = async (email: string): Promise<string> => {
  const { data } = await api.post<BaseResponseWithData<{ message: string }>>(
    "/auth/resend-verification",
    {
      email,
    },
  );

  return data.data.message;
};

export const forgotPassword = async (input: ForgotPasswordInput): Promise<string> => {
  const { data } = await api.post<BaseResponseWithData<{ message: string }>>(
    "/auth/forgot-password",
    input,
  );

  return data.data.message;
};

export const resetPassword = async (input: ResetPasswordInput): Promise<string> => {
  const { data } = await api.post<BaseResponseWithData<{ message: string }>>(
    "/auth/reset-password",
    {
      token: input.token,
      password: input.password,
    },
  );

  return data.data.message;
};

export const previewInvitation = async (token: string): Promise<InvitationPreview> => {
  const { data } = await api.get<BaseResponseWithData<InvitationPreview>>(
    "/auth/invitations/preview",
    {
      params: { token },
    },
  );

  return data.data;
};

export const acceptInvitationNewUser = async (
  input: InviteAcceptNewUserInput,
): Promise<{ membershipId: string }> => {
  const { data } = await api.post<BaseResponseWithData<{ membershipId: string }>>(
    "/auth/invitations/accept",
    {
      token: input.token,
      firstName: input.firstName,
      lastName: input.lastName,
      password: input.password,
    },
  );

  return data.data;
};

export const acceptInvitationAuthenticated = async (
  token: string,
): Promise<{ membership: { id: string; organizationId: string; role: OrganizationRole } }> => {
  const { data } = await api.post<
    BaseResponseWithData<{
      membership: { id: string; organizationId: string; role: OrganizationRole };
    }>
  >("/auth/invitations/accept", { token });

  return data.data;
};

export const switchOrganization = async (
  organizationId: string,
): Promise<{
  activeOrganization: { id: string; name: string; slug: string };
  activeMembership: { id: string; role: OrganizationRole; status: string };
}> => {
  const { data } = await api.post<
    BaseResponseWithData<{
      activeOrganization: { id: string; name: string; slug: string };
      activeMembership: { id: string; role: OrganizationRole; status: string };
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
