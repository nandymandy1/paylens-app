import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Password is required").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    organizationName: z.string().trim().min(1, "Organization name is required").max(120),
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid work email")),
    password: z.string().min(12, "Use at least 12 characters").max(128),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(12, "Use at least 12 characters").max(128),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const inviteAcceptNewUserSchema = z
  .object({
    token: z.string().min(1),
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    password: z.string().min(12, "Use at least 12 characters").max(128),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type InviteAcceptNewUserInput = z.infer<typeof inviteAcceptNewUserSchema>;

export type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  status: string;
};

export type MembershipSummary = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: string;
  status: string;
};

export type MeResponse = {
  user: SafeUser;
  memberships: MembershipSummary[];
  activeOrganization: { id: string; name: string; slug: string } | null;
  activeMembership: { id: string; role: string; status: string } | null;
  onboardingRequired: boolean;
  organizationSelectionRequired: boolean;
};

export type InvitationPreview = {
  id: string;
  organization: { id: string; name: string };
  email: string;
  role: string;
  expiresAt: string;
};
