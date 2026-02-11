import { AnalyticsEvent } from '@stytch/core';
import { useCallback } from 'react';

import { readB2CInternals } from '../../../internals';
import { useStytch } from '../ContextProvider';

export const useEventLogger = () => {
  const stytchClient = useStytch();
  const logEvent = useCallback(
    (event: AnalyticsEvent) => {
      readB2CInternals(stytchClient).networkClient.logEvent(event);
    },
    [stytchClient],
  );
  return { logEvent };
};
