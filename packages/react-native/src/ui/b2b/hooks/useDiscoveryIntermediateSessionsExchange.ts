import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useDiscoveryIntermediateSessionsExchange = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const discoveryIntermediateSessionsExchange = async (orgId: string) => {
    dispatch({ type: 'discovery/intermediateSessions/exchange' });
    try {
      const response = await stytchClient.discovery.intermediateSessions.exchange({
        organization_id: orgId,
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
      });
      onEvent({ type: StytchEventType.B2BDiscoveryIntermediateSessionExchange, data: response });
      dispatch({ type: 'discovery/intermediateSessions/exchange/success', response: response });
      dispatch({
        type: 'mfa/primaryAuthenticate/success',
        response: response,
        includedMfaMethods: config.productConfig.mfaProductInclude,
      });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'discovery/intermediateSessions/exchange/error', error: errorResponse });
    }
  };
  return { discoveryIntermediateSessionsExchange };
};
