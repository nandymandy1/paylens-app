/** Canonical auth route paths. Use these everywhere instead of raw strings. */
export const AUTH_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyEmail: "/auth/verify-email",
  callback: "/auth/callback",
  inviteAccept: "/auth/invite/accept",
  selectOrganization: "/auth/select-organization",
  onboardingOrganization: "/auth/onboarding/organization",
} as const;

/** Authentication entry pages — must never be post-auth destinations. */
export const AUTH_ENTRY_PATHS: Set<string> = new Set([
  AUTH_ROUTES.login,
  AUTH_ROUTES.register,
  AUTH_ROUTES.forgotPassword,
  AUTH_ROUTES.resetPassword,
  AUTH_ROUTES.verifyEmail,
  AUTH_ROUTES.callback,
]);

/** Valid post-auth destination prefixes. */
export const POST_AUTH_PREFIXES = [
  "/dashboard",
  AUTH_ROUTES.selectOrganization,
  AUTH_ROUTES.onboardingOrganization,
  AUTH_ROUTES.inviteAccept,
];

export const DEFAULT_POST_AUTH_REDIRECT = "/dashboard";
