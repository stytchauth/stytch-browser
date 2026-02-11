import { StytchEventType } from '@stytch/core/public';

import { useConfig, useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useMagicLinksAuthenticate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const magicLinksAuthenticate = async (token: string) => {
    dispatch({ type: 'magicLinks/authenticate' });
    try {
      const response = await stytchClient.magicLinks.authenticate({
        magic_links_token: token,
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
        locale: config.productConfig.emailMagicLinksOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BMagicLinkAuthenticate, data: response });
      dispatch({ type: 'magicLinks/authenticate/success', response: response });
      dispatch({
        type: 'mfa/primaryAuthenticate/success',
        response: response,
        includedMfaMethods: config.productConfig.mfaProductInclude,
      });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'magicLinks/authenticate/error', error: errorResponse });
    }
  };
  return { magicLinksAuthenticate };
};
