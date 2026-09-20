"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import { Plus } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import EmployeeFilters from "@/components/employees/EmployeeFilters";
import EmployeeDeleteDialog from "@/components/employees/EmployeeDeleteDialog";
import EmployeeFormModal from "@/components/employees/EmployeeFormModal";
import EmployeesTable from "@/components/employees/EmployeesTable";
import EmployeeExportMenu from "@/components/transfers/EmployeeExportMenu";
import EmployeeImportWizard from "@/components/transfers/EmployeeImportWizard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useMe } from "@/hooks/useAuth";
import { useCrudModal } from "@/hooks/useCrudModalParams";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDepartments, useEmployees } from "@/hooks/useEmployees";
import type { EmployeeDirection, EmployeeSort } from "@/types/employee.type";
import {
  EMPLOYEE_DIRECTIONS,
  EMPLOYEE_DIRECTORY_ROLES,
  EMPLOYEE_SORTS,
  EMPLOYEE_WRITE_ROLES,
} from "@/types/employee.type";

const ALL = "ALL";
const PAGE_LIMIT = 25;

/** Modal params ride alongside directory state; they never reset filters. */
const MODAL_KEYS = ["employeeModal", "employeeId"] as const;

const withoutModal = (params: URLSearchParams): string => {
  const copy = new URLSearchParams(params.toString());

  for (const key of MODAL_KEYS) {
    copy.delete(key);
  }

  return copy.toString();
};

/** Cursor page state: `null` is the canonical first-page sentinel. */
type CursorState = string | null;

type UrlSyncOptions = {
  cursor?: CursorState;
  mode?: "push" | "replace";
};

const asSort = (value: string | null): EmployeeSort =>
  value && (EMPLOYEE_SORTS as readonly string[]).includes(value)
    ? (value as EmployeeSort)
    : "lastName";

const asDirection = (value: string | null): EmployeeDirection =>
  value && (EMPLOYEE_DIRECTIONS as readonly string[]).includes(value)
    ? (value as EmployeeDirection)
    : "asc";

const EmployeesDirectory: FC = () => {
  const router = useRouter();
  const { data: session } = useMe();
  const searchParams = useSearchParams();

  const activeRole = session?.activeMembership?.role;
  const canView = activeRole
    ? (EMPLOYEE_DIRECTORY_ROLES as readonly string[]).includes(activeRole)
    : false;
  const canManage = activeRole
    ? (EMPLOYEE_WRITE_ROLES as readonly string[]).includes(activeRole)
    : false;
  const organizationId = session?.activeOrganization?.id;

  const modal = useCrudModal({
    modalKey: "employeeModal",
    idKey: "employeeId",
    allowed: ["create", "edit", "delete"],
    organizationId,
  });

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [departmentId, setDepartmentId] = useState(searchParams.get("departmentId") ?? ALL);
  const [countryCode, setCountryCode] = useState(searchParams.get("countryCode") ?? ALL);
  const [status, setStatus] = useState(searchParams.get("status") ?? ALL);
  const [employmentType, setEmploymentType] = useState(searchParams.get("employmentType") ?? ALL);
  const [sort, setSort] = useState<EmployeeSort>(asSort(searchParams.get("sort")));
  const [direction, setDirection] = useState<EmployeeDirection>(
    asDirection(searchParams.get("direction")),
  );
  const [cursorStack, setCursorStack] = useState<CursorState[]>([]);
  const [cursor, setCursor] = useState<CursorState>(searchParams.get("cursor"));
  const [importOpen, setImportOpen] = useState(false);
  const lastSyncRef = useRef(searchParams.toString());

  const debouncedSearch = useDebouncedValue(searchInput);

  const syncUrl = useCallback(
    (next: Record<string, string>, options?: UrlSyncOptions) => {
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(next)) {
        if (value && value !== ALL) {
          params.set(key, value);
        }
      }

      if (options?.cursor) {
        params.set("cursor", options.cursor);
      }

      // CRUD modal state survives filter/search/sort/cursor navigation.
      for (const key of MODAL_KEYS) {
        const current = searchParams.get(key);

        if (current) {
          params.set(key, current);
        }
      }

      lastSyncRef.current = params.toString();

      const navigate = options?.mode === "push" ? router.push : router.replace;

      navigate(`/dashboard/employees${params.size > 0 ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const snapshot = useCallback(
    () => ({
      search: debouncedSearch,
      departmentId,
      countryCode,
      status,
      employmentType,
      sort,
      direction,
    }),
    [debouncedSearch, departmentId, countryCode, status, employmentType, sort, direction],
  );

  const resetCursor = useCallback(() => {
    setCursorStack([]);
    setCursor(null);
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      resetCursor();
    },
    [resetCursor],
  );

  const updateFilter = useCallback(
    (patch: Partial<Record<string, string>>) => {
      const next = { ...snapshot(), ...patch };

      syncUrl(next);
      resetCursor();
    },
    [snapshot, syncUrl, resetCursor],
  );

  const queryParams = useMemo(
    () => ({
      direction,
      limit: PAGE_LIMIT,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(departmentId !== ALL ? { departmentId } : {}),
      ...(countryCode !== ALL ? { countryCode } : {}),
      ...(status !== ALL ? { status } : {}),
      ...(employmentType !== ALL ? { employmentType } : {}),
      sort,
      ...(cursor ? { cursor } : {}),
    }),
    [debouncedSearch, departmentId, countryCode, status, employmentType, sort, direction, cursor],
  );

  const employees = useEmployees(queryParams, { enabled: canView });
  const departments = useDepartments({ enabled: canView });

  // Authoritative in-flight guard: while a cursor transition is unresolved the
  // query keeps showing placeholder data (`placeholderData: previous`), which
  // is exactly when `isPlaceholderData` is true. Both buttons and handlers
  // honor this so a rapid second click cannot reuse a stale nextCursor and
  // corrupt the cursor stack. `isFetching` is deliberately excluded: a
  // background refetch of already-settled data (e.g. back-navigation to a
  // cached page) must not freeze navigation — the displayed page and cursor
  // stack are already correct in that state.
  const paginationBusy = employees.isPlaceholderData;

  const hasActiveFilters =
    debouncedSearch.trim() !== "" ||
    departmentId !== ALL ||
    countryCode !== ALL ||
    status !== ALL ||
    employmentType !== ALL;

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setDepartmentId(ALL);
    setCountryCode(ALL);
    setStatus(ALL);
    setEmploymentType(ALL);
    syncUrl({ search: "", sort, direction });
    resetCursor();
  }, [syncUrl, sort, direction, resetCursor]);

  const goNext = useCallback(() => {
    if (paginationBusy) {
      return;
    }

    const nextCursor = employees.data?.pageInfo.nextCursor;

    if (!nextCursor) {
      return;
    }

    setCursorStack((stack) => [...stack, cursor]);
    setCursor(nextCursor);
    syncUrl(snapshot(), { cursor: nextCursor, mode: "push" });
  }, [paginationBusy, employees.data?.pageInfo.nextCursor, cursor, snapshot, syncUrl]);

  const goPrevious = useCallback(() => {
    if (paginationBusy || cursorStack.length === 0) {
      return;
    }

    const restored = cursorStack[cursorStack.length - 1] ?? null;

    setCursorStack((stack) => stack.slice(0, -1));
    setCursor(restored);
    syncUrl(snapshot(), { cursor: restored, mode: "push" });
  }, [paginationBusy, cursorStack, snapshot, syncUrl]);

  // Adopt browser navigation (Back/Forward) and deep links: when the URL
  // changes without a local write, the URL is authoritative. The local
  // cursor history is dropped because opaque cursors cannot reconstruct it.
  // Modal-only changes (open/close) never disturb filter or cursor state.
  useEffect(() => {
    if (lastSyncRef.current === searchParams.toString()) {
      return;
    }

    if (withoutModal(new URLSearchParams(lastSyncRef.current)) === withoutModal(searchParams)) {
      lastSyncRef.current = searchParams.toString();

      return;
    }

    lastSyncRef.current = searchParams.toString();
    setSearchInput(searchParams.get("search") ?? "");
    setDepartmentId(searchParams.get("departmentId") ?? ALL);
    setCountryCode(searchParams.get("countryCode") ?? ALL);
    setStatus(searchParams.get("status") ?? ALL);
    setEmploymentType(searchParams.get("employmentType") ?? ALL);
    setSort(asSort(searchParams.get("sort")));
    setDirection(asDirection(searchParams.get("direction")));
    setCursor(searchParams.get("cursor"));
    setCursorStack([]);
  }, [searchParams]);

  // Keep the URL in sync once the debounced search settles.
  useEffect(() => {
    // Skip while keystrokes are pending or a navigation adopt is in flight.
    if (searchInput !== debouncedSearch) {
      return;
    }

    const urlSearch = searchParams.get("search") ?? "";

    if (debouncedSearch !== urlSearch) {
      syncUrl({ ...snapshot(), search: debouncedSearch });
    }
  }, [debouncedSearch, searchInput, searchParams, snapshot, syncUrl]);

  return (
    <section className="dashboard-content-enter relative z-10 w-full min-w-0 space-y-6">
      <DashboardPageHeader
        description="Browse and understand your organization's workforce."
        title="Employees"
        eyebrow="Workforce"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canView && <EmployeeExportMenu />}
            {canManage && (
              <>
                <Button onClick={() => setImportOpen(true)} variant="outline">
                  Import
                </Button>
                <Button
                  prefixIcon={<Plus aria-hidden="true" className="size-4" />}
                  onClick={modal.openCreate}
                >
                  Add employee
                </Button>
              </>
            )}
          </div>
        }
      />

      {!canView && (
        <Card variant="soft">
          <Card.Content>
            <p className="text-sm text-body">
              Your role cannot view the employee directory. Contact your workspace administrator.
            </p>
          </Card.Content>
        </Card>
      )}

      {canView && (
        <>
          <EmployeeFilters
            countryCode={countryCode}
            departmentId={departmentId}
            departments={departments.data}
            direction={direction}
            employmentType={employmentType}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onCountryChange={(value) => {
              setCountryCode(value);
              updateFilter({ countryCode: value });
            }}
            onDepartmentChange={(value) => {
              setDepartmentId(value);
              updateFilter({ departmentId: value });
            }}
            onDirectionChange={(value) => {
              setDirection(value);
              updateFilter({ direction: value });
            }}
            onEmploymentTypeChange={(value) => {
              setEmploymentType(value);
              updateFilter({ employmentType: value });
            }}
            onSearchChange={handleSearchChange}
            onSortChange={(value) => {
              setSort(value);
              updateFilter({ sort: value });
            }}
            onStatusChange={(value) => {
              setStatus(value);
              updateFilter({ status: value });
            }}
            search={searchInput}
            sort={sort}
            status={status}
          />

          {employees.isError ? (
            <Card variant="soft">
              <Card.Content>
                <p className="text-sm text-body">We couldn&apos;t load employees.</p>
                <div className="mt-3">
                  <Button onClick={() => employees.refetch()} variant="outline">
                    Retry
                  </Button>
                </div>
              </Card.Content>
            </Card>
          ) : (
            <>
              <EmployeesTable
                employees={employees.data?.items}
                hasActiveFilters={hasActiveFilters}
                isLoading={employees.isPending}
                canManage={canManage}
                onClearFilters={clearFilters}
                onEdit={(employee) => modal.openEntity("edit", employee.id)}
                onDelete={(employee) => modal.openEntity("delete", employee.id)}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  disabled={cursorStack.length === 0 || paginationBusy}
                  onClick={goPrevious}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={!employees.data?.pageInfo.hasNextPage || paginationBusy}
                  onClick={goNext}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </>
      )}

      <EmployeeFormModal
        mode={modal.mode === "create" || modal.mode === "edit" ? modal.mode : null}
        employeeId={modal.entityId}
        onClose={modal.close}
      />
      <EmployeeDeleteDialog
        employeeId={modal.mode === "delete" ? modal.entityId : null}
        onClose={modal.close}
      />
      <EmployeeImportWizard open={importOpen} onClose={() => setImportOpen(false)} />
    </section>
  );
};

const EmployeesPage: FC = () => (
  <Suspense fallback={<p className="text-sm text-body">Loading employees.</p>}>
    <EmployeesDirectory />
  </Suspense>
);

export default EmployeesPage;
