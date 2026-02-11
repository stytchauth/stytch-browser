import { StytchEventType } from '@stytch/core/public';
import { useConfig, useEventCallback, useGlobalReducer, useRedirectUrl, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useMagicLinksEmailDiscoverySend = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const email = state.memberState.emailAddress.emailAddress;
  const redirectUrl = useRedirectUrl();
  const magicLinksEmailDiscoverySend = async () => {
    dispatch({ type: 'magicLinks/email/discovery/send' });
    if (!email) {
      dispatch({ type: 'magicLinks/email/discovery/send/error', error: { internalError: 'Missing email' } });
      return;
    }

    try {
      const response = await stytchClient.magicLinks.email.discovery.send({
        email_address: email,
        discovery_redirect_url: redirectUrl,
        login_template_id: config.productConfig.emailMagicLinksOptions?.loginTemplateId,
        locale: config.productConfig.emailMagicLinksOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BMagicLinkEmailDiscoverySend, data: response });
      dispatch({ type: 'magicLinks/email/discovery/send/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'magicLinks/email/discovery/send/error', error: errorResponse });
    }
  };
  return { magicLinksEmailDiscoverySend };
};
