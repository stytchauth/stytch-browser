import { ResponseCommon, StytchAPIError } from '@stytch/core/public';
import { useStytch, useGlobalReducer, useConfig } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { StytchMutationKey, useMutate } from '../utils';

export const useEmlDiscoverySend = () => {
  const [, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();

  return useMutate<ResponseCommon, StytchAPIError, StytchMutationKey, { email: string }>(
    'stytch.magicLinks.email.discovery.send',
    (_: string, { arg: { email } }: { arg: { email: string } }) =>
      stytchClient.magicLinks.email.discovery.send({
        email_address: email,
        discovery_redirect_url: config.emailMagicLinksOptions?.discoveryRedirectURL,
        login_template_id: config.emailMagicLinksOptions?.loginTemplateId,
        locale: config.emailMagicLinksOptions?.locale,
      }),
    {
      onSuccess: () => {
        dispatch({ type: 'transition', screen: AppScreens.EmailConfirmation });
      },
    },
  );
};
