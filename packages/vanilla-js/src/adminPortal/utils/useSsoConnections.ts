import useSWR from 'swr';
import { useStytchClient } from '../utils/useStytchClient';

export const ssoGetConnectionsKey = (orgId: string | undefined) => ['sso.getConnections', orgId];

export const useSsoConnections = ({ shouldFetch }: { shouldFetch: boolean }) => {
  const client = useStytchClient();
  const orgId = client.organization.getSync()?.organization_id;

  return useSWR(shouldFetch ? ssoGetConnectionsKey(orgId) : null, () => {
    return client.sso.getConnections();
  });
};
