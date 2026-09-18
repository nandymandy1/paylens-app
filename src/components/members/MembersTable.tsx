"use client";

import Link from "next/link";
import type { FC } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import DataTable, { type DataTableColumn, type DataTableRow } from "@/components/ui/Table";
import type { OrganizationMember, OrganizationRole } from "@/types/organization.type";

type MembersTableProps = {
  canMutateRoles: boolean;
  isLoading: boolean;
  members: OrganizationMember[] | undefined;
  onRoleChange: (id: string, role: OrganizationRole) => void;
  roleOptions: readonly OrganizationRole[];
};

const columns: DataTableColumn[] = [
  { header: "Member", id: "member" },
  { header: "Role", id: "role" },
  { header: "Status", id: "status" },
  { align: "right", header: "Actions", id: "actions" },
];

const MembersTable: FC<MembersTableProps> = ({
  canMutateRoles,
  isLoading,
  members,
  onRoleChange,
  roleOptions,
}) => {
  const rows: DataTableRow[] =
    members?.map((member) => ({
      cells: {
        actions: (
          <Link
            aria-label={`View ${member.email} profile`}
            className="font-medium text-ink underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            href={`/dashboard/members/${member.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            View
          </Link>
        ),
        member: (
          <Link
            className="flex min-w-52 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            href={`/dashboard/members/${member.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <Avatar
              alt={member.email}
              fallback={`${member.firstName}${member.lastName}`}
              size="md"
            />
            <span>
              <span className="block font-medium text-ink">
                {member.firstName} {member.lastName}
              </span>
              <span className="block text-xs text-body">{member.email}</span>
            </span>
          </Link>
        ),
        role:
          member.role === "TENANT_OWNER" || !canMutateRoles ? (
            <span aria-label={`Role for ${member.email}`}>
              <Badge variant="info">{member.role.replaceAll("_", " ")}</Badge>
            </span>
          ) : (
            <div onClick={(event) => event.stopPropagation()}>
              <Select
                aria-label={`Role for ${member.email}`}
                defaultValue={member.role}
                onChange={(role) => onRoleChange(member.id, role)}
                options={roleOptions.map((role) => ({
                  title: role.replaceAll("_", " "),
                  value: role,
                }))}
                size="sm"
              />
            </div>
          ),
        status: (
          <Badge variant={member.status === "ACTIVE" ? "success" : "info"}>{member.status}</Badge>
        ),
      },
      id: member.id,
    })) ?? [];

  return (
    <DataTable
      ariaLabel="Active organization members"
      columns={columns}
      emptyState="No members yet."
      loading={isLoading}
      rows={rows}
    />
  );
};

export default MembersTable;
