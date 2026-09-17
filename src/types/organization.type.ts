import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required").max(120),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export type OrganizationMember = {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
};

export type OrganizationInvitationSummary = {
  id: string;
  email: string;
  role: string;
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
