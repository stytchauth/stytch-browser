import { ResponseCommon, StytchAPIError } from '@stytch/core/public';
import { useStytch, useGlobalReducer, useConfig } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { StytchMutationKey, useMutate } from '../utils';
import { logger } from '@stytch/core';

export const useEmlLoginOrSignup = () => {
  const [, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();

  return useMutate<ResponseCommon, StytchAPIError, StytchMutationKey, { email: string; organization_id: string }>(
    'stytch.magicLinks.email.loginOrSignup',
    (_: string, { arg: { email, organization_id } }: { arg: { email: string; organization_id: string } }) =>
      stytchClient.magicLinks.email.loginOrSignup({
        email_address: email,
        organization_id,
        login_redirect_url: config.emailMagicLinksOptions?.loginRedirectURL,
        signup_redirect_url: config.emailMagicLinksOptions?.signupRedirectURL,
        login_template_id: config.emailMagicLinksOptions?.loginTemplateId,
        signup_template_id: config.emailMagicLinksOptions?.signupTemplateId,
        locale: config.emailMagicLinksOptions?.locale,
      }),
    {
      onSuccess: () => {
        dispatch({ type: 'transition', screen: AppScreens.EmailConfirmation });
      },
      onError: (e) => {
        logger.error(e);
      },
    },
  );
};
