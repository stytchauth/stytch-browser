import { B2BOrganizationsUpdateOptions, Organization } from '@stytch/core/public';
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

import { organizationGetKey } from './organizationGetKey';
import { useMutateWithToast } from './useMutateWithToast';
import { useStytchClient } from './useStytchClient';

export const useMutateOrganization = () => {
  const { mutate: mutateSWR } = useSWRConfig();
  const client = useStytchClient();

  return useMutateWithToast<B2BOrganizationsUpdateOptions>(
    useCallback(
      async (properties) => {
        const organizationId = client.organization.getSync()?.organization_id;

        await mutateSWR(
          organizationGetKey(organizationId),
          async () => {
            const resp = await client.organization.update(properties);
            return resp.organization;
          },
          {
            // note that optimisticData is typed as `any`
            optimisticData: (org: Organization) => ({ ...org, ...properties }),
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          },
        );
      },
      [client.organization, mutateSWR],
    ),
  );
};
