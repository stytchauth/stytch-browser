import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

import { ssoGetConnectionsKey } from './useSsoConnections';
import { useStytchClient } from './useStytchClient';

export const useRevalidateConnectionList = () => {
  const { mutate } = useSWRConfig();
  const client = useStytchClient();

  return useCallback(() => {
    const orgId = client.organization.getSync()?.organization_id;
    if (orgId) {
      return mutate(ssoGetConnectionsKey(orgId));
    }
  }, [client.organization, mutate]);
};
