import useSWR from 'swr';
import { useStytchClient } from '../utils/useStytchClient';
import { useOrgInfo } from './useOrgInfo';

export const scimGetConnectionKey = (connectionId: string | undefined) =>
  connectionId ? ['scim.getConnection', connectionId] : null;

export const useScimConnection = ({ shouldFetch }: { shouldFetch: boolean }) => {
  const client = useStytchClient();
  const { data } = useOrgInfo();
  const connectionId = data?.scim_active_connection?.connection_id;

  return useSWR(shouldFetch ? scimGetConnectionKey(connectionId) : null, async () => {
    const result = await client.scim.getConnection(connectionId!);
    return result.connection;
  });
};
