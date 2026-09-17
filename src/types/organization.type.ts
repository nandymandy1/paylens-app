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
