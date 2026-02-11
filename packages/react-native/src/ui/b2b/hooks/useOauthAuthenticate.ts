import { StytchEventType } from '@stytch/core/public';
import { useConfig, useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useOauthAuthenticate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const oauthAuthenticate = async (token: string) => {
    dispatch({ type: 'oauth/authenticate' });
    try {
      const response = await stytchClient.oauth.authenticate({
        oauth_token: token,
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
        locale: config.productConfig.oauthOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BOAuthAuthenticate, data: response });
      dispatch({ type: 'oauth/authenticate/success', response: response });
      dispatch({
        type: 'mfa/primaryAuthenticate/success',
        response: response,
        includedMfaMethods: config.productConfig.mfaProductInclude,
      });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'oauth/authenticate/error', error: errorResponse });
    }
  };
  return { oauthAuthenticate };
};
