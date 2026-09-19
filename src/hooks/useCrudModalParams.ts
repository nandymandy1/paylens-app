"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type CrudModalConfig = {
  modalKey: string;
  idKey: string;
  allowed: readonly string[];
  organizationId: string | undefined;
};

export type CrudModalState = {
  mode: string | null;
  entityId: string | null;
  openCreate: () => void;
  openEntity: (mode: string, entityId: string) => void;
  close: () => void;
};

/**
 * URL-bound CRUD modal state (UI-R2). The query string owns modal
 * visibility/type; local state only carries form internals. Opening pushes
 * history (Back closes); closing/success replaces (no reopen on Back).
 * Unrelated params (search/filters/sort) are always preserved.
 */
export const useCrudModal = ({
  modalKey,
  idKey,
  allowed,
  organizationId,
}: CrudModalConfig): CrudModalState => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cleanedInvalidRef = useRef<string | null>(null);
  const previousOrgRef = useRef<string | undefined>(undefined);
  const mountedRef = useRef(false);

  const rawMode = searchParams.get(modalKey);
  const rawId = searchParams.get(idKey);
  const mode = rawMode && (allowed as readonly string[]).includes(rawMode) ? rawMode : null;
  const needsId = mode === "edit" || mode === "delete";
  const activeMode = needsId && !rawId ? null : mode;
  const entityId = activeMode && activeMode !== "create" ? rawId : null;
  const hasInvalidParams = Boolean(
    rawMode && (!mode || (needsId && !rawId) || (mode === "create" && rawId)),
  );

  const buildUrl = useCallback(
    (mutate: (params: URLSearchParams) => void): string => {
      const params = new URLSearchParams(searchParams.toString());

      mutate(params);

      const query = params.toString();

      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  const openCreate = useCallback(() => {
    router.push(
      buildUrl((params) => {
        params.set(modalKey, "create");
        params.delete(idKey);
      }),
      { scroll: false },
    );
  }, [buildUrl, idKey, modalKey, router]);

  const openEntity = useCallback(
    (nextMode: string, nextId: string) => {
      if (!(allowed as readonly string[]).includes(nextMode)) {
        return;
      }

      router.push(
        buildUrl((params) => {
          params.set(modalKey, nextMode);
          params.set(idKey, nextId);
        }),
        { scroll: false },
      );
    },
    [allowed, buildUrl, idKey, modalKey, router],
  );

  const close = useCallback(() => {
    router.replace(
      buildUrl((params) => {
        params.delete(modalKey);
        params.delete(idKey);
      }),
      { scroll: false },
    );
  }, [buildUrl, idKey, modalKey, router]);

  // Malformed or incomplete modal params never render a broken modal: clean once.
  useEffect(() => {
    if (!hasInvalidParams) {
      return;
    }

    const signature = `${rawMode ?? ""}:${rawId ?? ""}`;

    if (cleanedInvalidRef.current === signature) {
      return;
    }

    cleanedInvalidRef.current = signature;

    const params = new URLSearchParams(searchParams.toString());

    if (mode === "create" && rawId) {
      params.delete(idKey);
    } else {
      params.delete(modalKey);
      params.delete(idKey);
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [hasInvalidParams, idKey, modalKey, mode, pathname, rawId, rawMode, router, searchParams]);

  // A modal loaded under Org A must never submit under Org B.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      previousOrgRef.current = organizationId;

      return;
    }

    const organizationChanged =
      Boolean(previousOrgRef.current) &&
      Boolean(organizationId) &&
      previousOrgRef.current !== organizationId;
    const organizationBecameUnknown = Boolean(previousOrgRef.current) && !organizationId;

    if ((organizationChanged || organizationBecameUnknown) && searchParams.get(modalKey)) {
      const params = new URLSearchParams(searchParams.toString());

      params.delete(modalKey);
      params.delete(idKey);

      const query = params.toString();

      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }

    // Retain Org A through an auth-resolution gap so Org B cannot resurrect
    // stale tenant-bound modal state after the URL has been cleaned.
    if (organizationId) {
      previousOrgRef.current = organizationId;
    }
  }, [idKey, modalKey, organizationId, pathname, router, searchParams]);

  return { mode: activeMode, entityId, openCreate, openEntity, close };
};
