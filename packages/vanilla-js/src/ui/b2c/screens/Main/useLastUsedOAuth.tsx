import { useStytch } from '../../GlobalContextProvider';
import { readB2CInternals } from '../../../../utils/internal';
import { useMemo } from 'react';
import { safeLocalStorage } from '../../../../utils/storage';
import { StringLiteralFromEnum } from '@stytch/core';
import { OAuthProviders } from '@stytch/core/public';

export function useLastUsedOAuth() {
  const stytch = useStytch();
  const { publicToken } = readB2CInternals(stytch);

  const lastUsedOAuth = useMemo(() => safeLocalStorage.getItem(publicToken, 'b2c_last_used_oauth'), [publicToken]);
  const setLastUsedOAuth = (providerType: StringLiteralFromEnum<OAuthProviders>) => {
    safeLocalStorage.setItem(publicToken, 'b2c_last_used_oauth', providerType);
  };

  return [lastUsedOAuth, setLastUsedOAuth] as const;
}
