import type { FC } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable, { type DataTableColumn, type DataTableRow } from "@/components/ui/Table";
import type { OrganizationInvitationSummary } from "@/types/organization.type";
import { formatDate, isPastDate } from "@/utils/date";
import { formatEnumLabel } from "@/utils/string";

type InvitationsTableProps = {
  invitations: OrganizationInvitationSummary[] | undefined;
  isLoading: boolean;
  isRevoking: boolean;
  onRevoke: (id: string) => void;
};

const columns: DataTableColumn[] = [
  { header: "Invitee", id: "invitee" },
  { header: "Role", id: "role" },
  { header: "Status", id: "status" },
  { header: "Expires", id: "expires" },
  { align: "right", header: "Actions", id: "actions" },
];

const invitationStatus = (invitation: OrganizationInvitationSummary) => {
  if (invitation.acceptedAt) return "Accepted";
  if (invitation.revokedAt) return "Revoked";

  return isPastDate(invitation.expiresAt) ? "Expired" : "Pending";
};

const statusVariant = (status: string) =>
  status === "Accepted" ? "success" : status === "Pending" ? "warning" : "info";

const InvitationsTable: FC<InvitationsTableProps> = ({
  invitations,
  isLoading,
  isRevoking,
  onRevoke,
}) => {
  const rows: DataTableRow[] =
    invitations?.map((invitation) => {
      const status = invitationStatus(invitation);
      const canRevoke = status === "Pending";

      return {
        cells: {
          actions: canRevoke ? (
            <Button
              loading={isRevoking}
              onClick={() => onRevoke(invitation.id)}
              size="sm"
              variant="outline"
            >
              Revoke
            </Button>
          ) : null,
          expires: formatDate(invitation.expiresAt),
          invitee: <span className="font-medium text-ink">{invitation.email}</span>,
          role: <Badge variant="info">{formatEnumLabel(invitation.role)}</Badge>,
          status: <Badge variant={statusVariant(status)}>{status}</Badge>,
        },
        id: invitation.id,
      };
    }) ?? [];

  return (
    <DataTable
      ariaLabel="Organization invitations"
      columns={columns}
      emptyState="No invitations."
      loading={isLoading}
      rows={rows}
    />
  );
};

export default InvitationsTable;
