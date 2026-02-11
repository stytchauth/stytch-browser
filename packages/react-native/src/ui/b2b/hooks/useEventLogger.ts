import { useStytch } from '../ContextProvider';
import { readB2BInternals } from '../../../internals';
import { AnalyticsEvent } from '@stytch/core';
import { useCallback } from 'react';

export const useEventLogger = () => {
  const stytchClient = useStytch();
  const logEvent = useCallback(
    (event: AnalyticsEvent) => {
      readB2BInternals(stytchClient).networkClient.logEvent(event);
    },
    [stytchClient],
  );
  return { logEvent };
};
