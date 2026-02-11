import { OAuthProviders } from '@stytch/core/public';
import { useMemo } from 'react';

import { readB2CInternals } from '../../../../utils/internal';
import { safeLocalStorage } from '../../../../utils/storage';
import { useStytch } from '../../GlobalContextProvider';

export function useLastUsedOAuth() {
  const stytch = useStytch();
  const { publicToken } = readB2CInternals(stytch);

  const lastUsedOAuth = useMemo(() => safeLocalStorage.getItem(publicToken, 'b2c_last_used_oauth'), [publicToken]);
  const setLastUsedOAuth = (providerType: OAuthProviders) => {
    safeLocalStorage.setItem(publicToken, 'b2c_last_used_oauth', providerType);
  };

  return [lastUsedOAuth, setLastUsedOAuth] as const;
}
