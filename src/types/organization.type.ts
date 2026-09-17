import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required").max(120),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const ORGANIZATION_ROLES = [
  "TENANT_OWNER",
  "HR_ADMIN",
  "HR_MANAGER",
  "MANAGER",
  "EMPLOYEE",
  "VIEWER_AUDITOR",
] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

/** Roles allowed to open the member-administration surface (backend authoritative). */
export const MEMBER_ADMIN_ROLES = ["TENANT_OWNER", "HR_ADMIN", "HR_MANAGER"] as const;

export type MemberAdminRole = (typeof MEMBER_ADMIN_ROLES)[number];

/** Invite options each admin role may ordinarily use (backend authoritative). */
export const INVITABLE_ROLES: Record<MemberAdminRole, readonly OrganizationRole[]> = {
  TENANT_OWNER: ["HR_ADMIN", "HR_MANAGER", "MANAGER", "EMPLOYEE", "VIEWER_AUDITOR"],
  HR_ADMIN: ["HR_MANAGER", "MANAGER", "EMPLOYEE", "VIEWER_AUDITOR"],
  HR_MANAGER: ["EMPLOYEE"],
};

export type OrganizationMember = {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: OrganizationRole;
  status: string;
  createdAt: string;
};

export type OrganizationInvitationSummary = {
  id: string;
  email: string;
  role: OrganizationRole;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
};
