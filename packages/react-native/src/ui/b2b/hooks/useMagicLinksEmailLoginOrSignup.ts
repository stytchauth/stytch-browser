import { StytchEventType } from '@stytch/core/public';

import { useConfig, useEventCallback, useGlobalReducer, useRedirectUrl, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useMagicLinksEmailLoginOrSignup = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const redirectUrl = useRedirectUrl();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const email = state.memberState.emailAddress.emailAddress;
  const organizationId =
    state.mfaState.primaryInfo?.organizationId ?? state.authenticationState.organization?.organization_id;
  const magicLinksEmailLoginOrSignup = async (orgId: string | undefined = organizationId) => {
    dispatch({ type: 'magicLinks/email/loginOrSignup' });
    if (!email) {
      dispatch({ type: 'magicLinks/email/loginOrSignup/error', error: { internalError: 'Missing email address' } });
      return;
    }
    if (!orgId) {
      dispatch({ type: 'magicLinks/email/loginOrSignup/error', error: { internalError: 'Missing organization' } });
      return;
    }

    try {
      const response = await stytchClient.magicLinks.email.loginOrSignup({
        email_address: email,
        organization_id: orgId,
        login_redirect_url: redirectUrl,
        signup_redirect_url: redirectUrl,
        login_template_id: config.productConfig.emailMagicLinksOptions?.loginTemplateId,
        signup_template_id: config.productConfig.emailMagicLinksOptions?.signupTemplateId,
        locale: config.productConfig.emailMagicLinksOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BMagicLinkEmailLoginOrSignup, data: { ...response, email } });
      dispatch({ type: 'magicLinks/email/loginOrSignup/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'magicLinks/email/loginOrSignup/error', error: errorResponse });
    }
  };
  return { magicLinksEmailLoginOrSignup };
};
