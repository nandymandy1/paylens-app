import api from "@/services/api";
import type {
  CreateOrganizationInput,
  OrganizationInvitationSummary,
  OrganizationMember,
  Organization,
} from "@/types/organization.type";

type Envelope<T> = {
  data: T;
  success: true;
  requestId?: string;
};

export const organizationKeys = {
  members: () => ["organizations", "members"] as const,
  invitations: () => ["organizations", "invitations"] as const,
};

export const createOrganization = async (
  input: CreateOrganizationInput,
): Promise<{
  organization: Organization;
}> => {
  const { data } = await api.post<Envelope<{ organization: Organization }>>(
    "/organizations",
    input,
  );

  return data.data;
};

export const fetchMembers = async (): Promise<OrganizationMember[]> => {
  const { data } = await api.get<Envelope<OrganizationMember[]>>("/organizations/current/members");

  return data.data;
};

export const fetchInvitations = async (): Promise<OrganizationInvitationSummary[]> => {
  const { data } = await api.get<Envelope<OrganizationInvitationSummary[]>>(
    "/organizations/current/invitations",
  );

  return data.data;
};

export const inviteMember = async (
  email: string,
  role: string,
): Promise<OrganizationInvitationSummary> => {
  const { data } = await api.post<Envelope<OrganizationInvitationSummary>>(
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
  role: string,
): Promise<{ id: string; role: string; status: string }> => {
  const { data } = await api.patch<Envelope<{ id: string; role: string; status: string }>>(
    `/organizations/current/members/${id}/role`,
    { role },
  );

  return data.data;
};
