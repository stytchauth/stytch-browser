import { KnownMemberStatus } from './MemberStatus';

const memberStatusDisplayNames: Record<KnownMemberStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  pending: 'Pending',
  deleted: 'Deactivated',
};

export const getMemberStatusDisplayName = (status: string) =>
  status in memberStatusDisplayNames ? memberStatusDisplayNames[status as KnownMemberStatus] : status;
