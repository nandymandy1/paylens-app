/**
 * Canonical string display helpers.
 *
 * Only domain-neutral pure formatting lives here. Feature-specific mappings
 * (status-to-badge variants, role gating) stay with their feature.
 */

/** Canonical initials for avatar fallbacks: "Narendra"+"Maurya" → "NM". */
export const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName.trim().slice(0, 1);
  const last = lastName.trim().slice(0, 1);

  return `${first}${last}`.toUpperCase();
};

/**
 * Canonical enum display formatting: "TENANT_OWNER" → "TENANT OWNER".
 * Preserves casing; replaces underscores with spaces only.
 */
export const formatEnumLabel = (value: string): string => value.replaceAll("_", " ");
