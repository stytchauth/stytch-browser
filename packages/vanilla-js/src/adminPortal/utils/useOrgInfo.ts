import useSWR from 'swr';
import { organizationGetKey } from './organizationGetKey';
import { useStytchClient } from './useStytchClient';

export const useOrgInfo = () => {
  const client = useStytchClient();
  const orgId = client.organization.getSync()?.organization_id;

  return useSWR(organizationGetKey(orgId), () => {
    return client.organization.get();
  });
};
