import { useSyncExternalStore } from 'react';
import { useStytch } from '../b2c/GlobalContextProvider';
import { User } from '@stytch/core/public';

// useStytchUser is a very lightweight copy-pasta of the hook from stytch-react
// If we end up calling this in several places, consider hoisting to global context
export const useStytchUser = (): User | null => {
  const stytch = useStytch();
  return useSyncExternalStore(stytch.onStateChange, () => stytch.user.getSync());
};
