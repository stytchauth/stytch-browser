import { ResponseCommon, StytchAPIError } from '@stytch/core/public';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { getOtpCodeExpiration } from '../getOtpCodeExpiration';
import { StytchMutationKey, useMutate } from '../utils';

export const useEmailOtpDiscoverySend = ({ throwOnError }: { throwOnError?: boolean } = {}) => {
  const [, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();

  return useMutate<ResponseCommon, StytchAPIError, StytchMutationKey, { email: string }>(
    'stytch.otps.email.discovery.send',
    (_key: string, { arg: { email } }: { arg: { email: string } }) =>
      stytchClient.otps.email.discovery.send({
        email_address: email,
        login_template_id: config.emailOtpOptions?.loginTemplateId,
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
