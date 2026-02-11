import { useConfig, useGlobalReducer, useRedirectUrl, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useEmlLoginOrCreate = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const redirectUrl = useRedirectUrl();
  const email = state.userState.emailAddress.emailAddress;
  const emailMagicLinkOptions = config.emailMagicLinksOptions;

  const sendEML = async () => {
    dispatch({ type: 'eml/loginOrCreate' });

    if (!email) {
      dispatch({ type: 'eml/loginOrCreate/error', error: { internalError: 'Missing email address' } });
      return;
    }

    try {
      const response = await stytchClient.magicLinks.email.loginOrCreate(email, {
        login_magic_link_url: redirectUrl,
        signup_magic_link_url: redirectUrl,
        signup_expiration_minutes: emailMagicLinkOptions.signupExpirationMinutes,
        login_expiration_minutes: emailMagicLinkOptions.loginExpirationMinutes,
        login_template_id: emailMagicLinkOptions.loginTemplateId,
        signup_template_id: emailMagicLinkOptions.signupTemplateId,
        locale: emailMagicLinkOptions.locale,
      });
      dispatch({ type: 'eml/loginOrCreate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'eml/loginOrCreate/error', error: errorResponse });
    }
  };
  return { sendEML };
};
