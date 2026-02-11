import { B2BSCIMUpdateConnectionOptions } from '@stytch/core/public';
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useMutateWithToast } from './useMutateWithToast';
import { useStytchClient } from './useStytchClient';
import { scimGetConnectionKey } from './useScimConnection';

export const useMutateScimConnectionRoleAssignments = () => {
  const { mutate: mutateSWR } = useSWRConfig();
  const client = useStytchClient();
  const org = client.organization.getSync();
  const connectionId = org?.scim_active_connection?.connection_id;

  return useMutateWithToast<
    Pick<B2BSCIMUpdateConnectionOptions, 'connection_id' | 'scim_group_implicit_role_assignments'>
  >(
    useCallback(
      async (properties) => {
        await mutateSWR(
          scimGetConnectionKey(connectionId),
          async () => {
            const resp = await client.scim.updateConnection({
              connection_id: properties.connection_id,
              scim_group_implicit_role_assignments: properties.scim_group_implicit_role_assignments,
            });
            return resp.connection;
          },
          {
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          },
        );
      },
      [client.scim, connectionId, mutateSWR],
    ),
  );
};
