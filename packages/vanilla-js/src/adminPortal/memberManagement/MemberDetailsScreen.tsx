import ChevronLeft from '@mui/icons-material/ChevronLeft';
import React from 'react';
import useSWR from 'swr';
import { extractErrorMessage } from '../../utils/extractErrorMessage';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { PageLoadingIndicator } from '../components/PageLoadingIndicator';
import { Tag } from '../components/Tag';
import { Typography } from '../components/Typography';
import { decorateCurrentMemberName } from '../utils/decorateCurrentMemberName';
import { memberGetKey } from '../utils/memberGetKey';
import { NO_VALUE } from '../utils/noValue';
import { useOrgInfo } from '../utils/useOrgInfo';
import { useSelf } from '../utils/useSelf';
import { useStytchClient } from '../utils/useStytchClient';
import { AccessSection } from './AccessSection';
import { AuthManagementSection } from './AuthManagementSection';
import { DangerZoneSection } from './DangerZoneSection';
import { MemberDetailsSection } from './MemberDetailsSection';
import { useMemberManagementRouterController } from './MemberManagementRouter';
import { allMemberStatuses } from './MemberStatus';
import { getMemberStatusDisplayName } from './getMemberStatusDisplayName';

const useMember = (memberId: string | undefined) => {
  const client = useStytchClient();

  return useSWR(memberGetKey(memberId), async () => {
    const response = await client.organization.members.search({
      limit: 1,
      query: {
        operator: 'AND',
        operands: [
          { filter_name: 'member_ids', filter_value: [memberId] },
          // Deleted members do not appear in search results by default, so we
          // need to specify all statuses explicitly
          { filter_name: 'statuses', filter_value: allMemberStatuses },
        ],
      },
    });

    return response.members.at(0) ?? null;
  });
};

export const MemberDetailsScreen = ({ memberId }: { memberId: string }) => {
  const { navigate } = useMemberManagementRouterController();

  const { data: member, error, isLoading } = useMember(memberId);
  const memberName = member?.name || NO_VALUE;

  const { self } = useSelf();
  const isSelf = self?.member_id === memberId;

  const memberDisplayName = isSelf ? decorateCurrentMemberName(memberName) : memberName;

  const { data: organization } = useOrgInfo();
  const orgRequiresMfa = organization?.mfa_policy === 'REQUIRED_FOR_ALL';

  return (
    <FlexBox flexDirection="column" gap={3}>
      <Button
        compact
        variant="ghost"
        onClick={() => {
          navigate({ screen: 'membersList' });
        }}
        startIcon={<ChevronLeft />}
      >
        Back to all Members
      </Button>
      {member ? (
        <>
          <FlexBox alignItems="center" justifyContent="flex-start" gap={1}>
            <Typography variant="h2">{memberDisplayName}</Typography>
            {member.status !== 'active' && <Tag size="small">{getMemberStatusDisplayName(member.status)}</Tag>}
          </FlexBox>
          <FlexBox flexDirection="column" gap={3}>
            <MemberDetailsSection member={member} />
            <AccessSection member={member} orgRequiresMfa={orgRequiresMfa} />
            {member.status === 'active' && <AuthManagementSection member={member} />}
            <DangerZoneSection member={member} />
          </FlexBox>
        </>
      ) : error || member === null ? (
        <Alert>{extractErrorMessage(error) ?? 'There was an error loading Member details.'}</Alert>
      ) : (
        isLoading && <PageLoadingIndicator />
      )}
    </FlexBox>
  );
};
