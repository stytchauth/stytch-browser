import { StytchEventType } from '@stytch/core/public';
import { useConfig, useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useSSOAuthenticate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const ssoAuthenticate = async (token: string) => {
    dispatch({ type: 'sso/authenticate' });
    try {
      const response = await stytchClient.sso.authenticate({
        sso_token: token,
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
      });
      onEvent({ type: StytchEventType.B2BSSOAuthenticate, data: response });
      dispatch({ type: 'sso/authenticate/success', response: response });
      dispatch({
        type: 'mfa/primaryAuthenticate/success',
        response: response,
        includedMfaMethods: config.productConfig.mfaProductInclude,
      });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'sso/authenticate/error', error: errorResponse });
    }
  };
  return { ssoAuthenticate };
};
