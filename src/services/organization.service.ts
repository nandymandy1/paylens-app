import api from "@/services/api";
import type { BaseResponseWithData } from "@/types/api-response.types";
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationInvitationSummary,
  OrganizationMember,
  OrganizationRole,
} from "@/types/organization.type";

export const organizationKeys = {
  members: (organizationId: string | undefined) =>
    ["organizations", organizationId, "members"] as const,
  member: (organizationId: string | undefined, membershipId: string) =>
    ["organizations", organizationId, "members", membershipId] as const,
  invitations: (organizationId: string | undefined) =>
    ["organizations", organizationId, "invitations"] as const,
};

export const createOrganization = async (
  input: CreateOrganizationInput,
): Promise<{
  organization: Organization;
}> => {
  const { data } = await api.post<BaseResponseWithData<{ organization: Organization }>>(
    "/organizations",
    input,
  );

  return data.data;
};

export const fetchMembers = async (): Promise<OrganizationMember[]> => {
  const { data } = await api.get<BaseResponseWithData<OrganizationMember[]>>(
    "/organizations/current/members",
  );

  return data.data;
};

export const fetchMember = async (membershipId: string): Promise<OrganizationMember> => {
  const { data } = await api.get<BaseResponseWithData<OrganizationMember>>(
    `/organizations/current/members/${membershipId}`,
  );

  return data.data;
};

export const fetchInvitations = async (): Promise<OrganizationInvitationSummary[]> => {
  const { data } = await api.get<BaseResponseWithData<OrganizationInvitationSummary[]>>(
    "/organizations/current/invitations",
  );

  return data.data;
};

export const inviteMember = async (
  email: string,
  role: OrganizationRole,
): Promise<OrganizationInvitationSummary> => {
  const { data } = await api.post<BaseResponseWithData<OrganizationInvitationSummary>>(
    "/organizations/current/invitations",
    { email, role },
  );

  return data.data;
};

export const revokeInvitation = async (id: string): Promise<void> => {
  await api.delete(`/organizations/current/invitations/${id}`);
};

export const changeMemberRole = async (
  id: string,
  role: OrganizationRole,
): Promise<{ id: string; role: OrganizationRole; status: string }> => {
  const { data } = await api.patch<
    BaseResponseWithData<{ id: string; role: OrganizationRole; status: string }>
  >(`/organizations/current/members/${id}/role`, { role });

  return data.data;
};
