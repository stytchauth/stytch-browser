import useSWR from 'swr';
import { useStytchClient } from '../utils/useStytchClient';
import { B2BSCIMGetConnectionGroupsResponse } from '@stytch/core/public';

export const MAX_LIMIT_CONNECTION_GROUPS = 1000;

export const scimGetConnectionGroupsKey = (orgId: string | undefined) => ['scim.getConnectionGroups', orgId];

export const useScimConnectionGroups = ({ shouldFetch }: { shouldFetch: boolean }) => {
  const client = useStytchClient();
  const org = client.organization.getSync();
  const orgId = org?.organization_id;

  return useSWR(shouldFetch ? scimGetConnectionGroupsKey(orgId) : null, async () => {
    let response = await client.scim.getConnectionGroups({ limit: MAX_LIMIT_CONNECTION_GROUPS });

    while (response.next_cursor) {
      await client.scim
        .getConnectionGroups({ limit: MAX_LIMIT_CONNECTION_GROUPS, cursor: response.next_cursor })
        .then((newResponse: B2BSCIMGetConnectionGroupsResponse) => {
          response = {
            ...response,
            scim_groups: [...response.scim_groups, ...newResponse.scim_groups],
            next_cursor: newResponse.next_cursor,
          };
        });
    }
    return response;
  });
};
