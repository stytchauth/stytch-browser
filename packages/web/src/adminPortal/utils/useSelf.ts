import { useSyncExternalStore } from 'react';

import { useStytchClient } from './useStytchClient';

export const useSelf = () => {
  const client = useStytchClient();
  const self = useSyncExternalStore(client.self.onChange, () => client.self.getSync());

  return {
    self,
    isSelf: (memberId: string | undefined) => (memberId ? self?.member_id === memberId : false),
    fromCache: client.self.getInfo().fromCache,
  };
};
