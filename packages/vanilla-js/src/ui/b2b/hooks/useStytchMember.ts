import { useSyncExternalStore } from 'react';
import { useStytch } from '../GlobalContextProvider';
import { Member } from '@stytch/core/public';

// useStytchMember is a very lightweight copy-pasta of the hook from stytch-react
// If we end up calling this in several places, consider hoisting to global context
export const useStytchMember = (): Member | null => {
  const stytch = useStytch();
  return useSyncExternalStore(stytch.onStateChange, () => stytch.self.getSync());
};
