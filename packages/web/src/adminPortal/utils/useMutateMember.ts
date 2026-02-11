import { B2BOrganizationsMembersUpdateOptions, Member } from '@stytch/core/public';
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

import { memberGetKey } from './memberGetKey';
import { useMutateWithToast } from './useMutateWithToast';
import { useStytchClient } from './useStytchClient';
import { useUpdateCachedMember } from './useUpdateCachedMember';

export const useMutateMember = () => {
  const { mutate: mutateSWR } = useSWRConfig();
  const client = useStytchClient();
  const { setMember } = useUpdateCachedMember();

  return useMutateWithToast<B2BOrganizationsMembersUpdateOptions>(
    useCallback(
      async (properties) => {
        const result = await mutateSWR(
          memberGetKey(properties.member_id),
          async () => {
            const resp = await client.organization.members.update(properties);
            return resp.member;
          },
          {
            // note that optimisticData is typed as `any`
            optimisticData: (member: Member) => {
              // Exclude roles from the optimistically updated version, because
              // its shape is different in the response and requires special
              // handling

              const { roles, ...rest } = properties;
              return { ...member, ...rest };
            },
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          },
        );

        if (result) {
          // Update the member in the cache, which includes matching entries in
          // any cached member lists
          setMember(result);
        }
      },
      [client.organization.members, mutateSWR, setMember],
    ),
  );
};
