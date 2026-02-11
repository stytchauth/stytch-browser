import { useMemo } from 'react';
import { safeLocalStorage } from '../../../utils/storage';
import { readB2BInternals } from '../../../utils/internal';
import { useStytch } from '../GlobalContextProvider';
import { LastUsedMethod } from '../types/authMethodKeys';

/**
 * Hook for managing the last used authentication method in B2B flows.
 * The returned value is not reactive and will not update when setLastUsedMethod is called.
 */
export function useLastUsedAuthMethod() {
  const stytch = useStytch();
  const { publicToken } = readB2BInternals(stytch);

  // Deliberately not using useLocalStorage because we _don't_ want the buttons
  // to reorder while the user is still seeing this page
  const lastUsedMethod = useMemo(() => safeLocalStorage.getItem(publicToken, 'b2b_last_used_method'), [publicToken]);
  const setLastUsedMethod = (method: LastUsedMethod) => {
    safeLocalStorage.setItem(publicToken, 'b2b_last_used_method', method);
  };

  return [lastUsedMethod, setLastUsedMethod] as const;
}
