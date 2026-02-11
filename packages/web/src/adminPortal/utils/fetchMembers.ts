import { B2BOrganizationsMembersSearchResponse, StytchProjectConfigurationInput } from '@stytch/core/public';

import { StytchB2BClient } from '../../b2b/StytchB2BClient';
import { isTruthy } from '../../utils/isTruthy';
import { KnownMemberStatus } from '../memberManagement/MemberStatus';

type FetchMembersResponse = B2BOrganizationsMembersSearchResponse & { isFetchMemberResponse: true };

export const fetchMembers =
  (client: StytchB2BClient<StytchProjectConfigurationInput>) =>
  async ({
    cursor,
    limit,
    email,
    roles,
    statuses,
  }: {
    cursor: string | undefined;
    limit: number;
    email: string | undefined;
    roles: string[] | undefined;
    statuses: KnownMemberStatus[] | undefined;
  }): Promise<FetchMembersResponse> => {
    const operands = [
      email && { filter_name: 'member_email_fuzzy', filter_value: email },
      roles && { filter_name: 'member_roles', filter_value: roles },
      statuses && { filter_name: 'statuses', filter_value: statuses },
    ].filter(isTruthy);

    const response = await client.organization.members.search({
      cursor,
      limit,
      query:
        operands.length > 0
          ? {
              operator: 'AND',
              operands: operands,
            }
          : undefined,
    });

    return {
      ...response,
      isFetchMemberResponse: true,
    };
  };

export const isFetchMembersResponse = (data: unknown): data is FetchMembersResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'isFetchMemberResponse' in data &&
    (data as FetchMembersResponse).isFetchMemberResponse
  );
};
