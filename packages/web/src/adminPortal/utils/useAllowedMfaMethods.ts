import { B2BAllowedMFAMethods, B2BMFAProducts } from '@stytch/core/public';
import { useMemo } from 'react';

import { isTruthy } from '../../utils/isTruthy';
import { useAdminPortalOrgUIConfig } from '../StytchClientContext';

const configMfaMethodMap: Record<B2BMFAProducts, B2BAllowedMFAMethods> = {
  smsOtp: 'sms_otp',
  totp: 'totp',
};

export const useAllowedMfaMethods = () => {
  const orgUIConfig = useAdminPortalOrgUIConfig();

  return useMemo(() => {
    const mfaMethods = orgUIConfig?.allowedMfaAuthMethods ?? (Object.keys(configMfaMethodMap) as B2BMFAProducts[]);
    return mfaMethods.map((method) => configMfaMethodMap[method]).filter(isTruthy);
  }, [orgUIConfig?.allowedMfaAuthMethods]);
};
