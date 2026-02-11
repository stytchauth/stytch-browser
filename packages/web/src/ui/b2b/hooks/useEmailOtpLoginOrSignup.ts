import { B2BOTPsEmailLoginOrSignupResponse, StytchAPIError } from '@stytch/core/public';

import { getOtpCodeExpiration } from '../getOtpCodeExpiration';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { StytchMutationKey, useMutate } from '../utils';

export const useEmailOtpLoginOrSignup = ({ throwOnError }: { throwOnError?: boolean } = {}) => {
  const [, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();

  return useMutate<
    B2BOTPsEmailLoginOrSignupResponse,
    StytchAPIError,
    StytchMutationKey,
    { email: string; organization_id: string }
  >(
    'stytch.otps.email.loginOrSignup',
    (_key: string, { arg: { email, organization_id } }: { arg: { email: string; organization_id: string } }) =>
      stytchClient.otps.email.loginOrSignup({
        email_address: email,
        organization_id,
        login_template_id: config.emailOtpOptions?.loginTemplateId,
        signup_template_id: config.emailOtpOptions?.signupTemplateId,
        locale: config.emailOtpOptions?.locale,
      }),
    {
      onSuccess: () => {
        dispatch({ type: 'send_email_otp', codeExpiration: getOtpCodeExpiration() });
      },
      throwOnError,
    },
  );
};
