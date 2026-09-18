/**
 * Canonical internal navigation/path behavior.
 *
 * Pure functions only. No React components, services, stores, or React Query.
 */

export type RouteMatchMode = "exact" | "section";

/**
 * Canonical route-active check.
 * exact: pathname === href only.
 * section: pathname === href OR pathname starts with `${href}/`
 * (so /dashboard/member never matches /dashboard/members).
 */
export const isRouteActive = (pathname: string, href: string, mode: RouteMatchMode): boolean => {
  if (mode === "exact") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

/**
 * Generic safe-internal-path check. Returns the path+search when candidate is
 * an internal path under one of allowedPrefixes, otherwise null.
 * Rejects protocol-relative, external, and javascript:/data:/vbscript: targets.
 */
export const getSafeInternalPath = (
  candidate: string | null,
  allowedPrefixes: readonly string[],
): string | null => {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(candidate, "https://paylens.local");
  } catch {
    return null;
  }

  if (parsed.host !== "paylens.local") {
    return null;
  }

  const path = `${parsed.pathname}${parsed.search}`;

  if (/^(javascript|data|vbscript):/i.test(path)) {
    return null;
  }

  const allowed = allowedPrefixes.some(
    (prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`),
  );

  if (!allowed) {
    return null;
  }

  return path;
};
