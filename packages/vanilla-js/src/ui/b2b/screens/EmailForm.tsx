import { B2BProducts, StytchAPIError } from '@stytch/core/public';
import React, { useState } from 'react';
import { EmailInput } from '../../components/EmailInput';
import { ErrorText } from '../../components/ErrorText';
import { Flex } from '../../components/Flex';
import { LoadingButton } from '../../components/LoadingButton';
import { SubmitButton } from '../../components/SubmitButton';
import { useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';
import { useEmailOtpDiscoverySend } from '../hooks/useEmailOtpDiscoverySend';
import { useEmailOtpLoginOrSignup } from '../hooks/useEmailOtpLoginOrSignup';
import { useEmlDiscoverySend } from '../hooks/useEmlDiscoverySend';
import { useEmlLoginOrSignup } from '../hooks/useEmlLoginOrSignup';
import { PasswordUseButton } from './PasswordUseButton';
import { useLingui } from '@lingui/react/macro';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import { useErrorProps } from '../../../utils/accessibility';

const JIT_PROVISIONING_ERRORS = ['email_jit_provisioning_not_allowed', 'invalid_email_for_jit_provisioning'];

const useParseErrorMessage = () => {
  const { t } = useLingui();
  return (error: StytchAPIError, { email, org: organizationName }: { email: string; org: string }) => {
    if (JIT_PROVISIONING_ERRORS.includes(error.error_type)) {
      return t({
        id: 'error.jitIneligible',
        message: `${email} does not have access to ${organizationName}. If you think this is a mistake, contact your admin`,
      });
    }
    return getTranslatedError(error, t);
  };
};

export const EmailForm = ({ showPasswordButton }: { showPasswordButton: boolean }) => {
  const [state, dispatch] = useGlobalReducer();
  const [emailInput, setEmailInput] = useState(state.formState.passwordState.email);
  const parseErrorMessage = useParseErrorMessage();
  const { t } = useLingui();

  const { products } = useEffectiveAuthConfig();
  const enableEml = products.includes(B2BProducts.emailMagicLinks);
  const enableOtp = products.includes(B2BProducts.emailOtp);

  const providedEmail = state.primary.email;
  const email = providedEmail || emailInput;

  const { trigger: stytchEmlLoginOrSignup, error: emlError, isMutating: emlIsMutating } = useEmlLoginOrSignup();
  const { trigger: stytchOtpLoginOrSignup, error: otpError, isMutating: otpIsMutating } = useEmailOtpLoginOrSignup();

  const isMutating = emlIsMutating || otpIsMutating;
  const error = emlError || otpError;
  const emailProps = useErrorProps(error);
  const emailInputLabel = t({ id: 'formField.email.label', message: 'Email' });

  const organization = state.flowState.organization;
  if (!organization) return <></>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: 'set_user_supplied_email', email });

    if (enableEml && enableOtp) {
      dispatch({ type: 'transition', screen: AppScreens.EmailMethodSelection, history: 'push' });
    } else if (enableEml) {
      stytchEmlLoginOrSignup({ email, organization_id: organization.organization_id });
    } else if (enableOtp) {
      stytchOtpLoginOrSignup({ email, organization_id: organization.organization_id });
    }
  };

  if (providedEmail) {
    return (
      <Flex direction="column" gap={12}>
        <Flex direction="column" gap={8}>
          {products
            .filter((product) => product === B2BProducts.emailMagicLinks || product === B2BProducts.emailOtp)
            .map((product) => {
              switch (product) {
                case B2BProducts.emailMagicLinks:
                  return (
                    <LoadingButton
                      key={product}
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'set_user_supplied_email', email });
                        stytchEmlLoginOrSignup({ email, organization_id: organization.organization_id });
                      }}
                      isLoading={emlIsMutating}
                      disabled={isMutating}
                      variant="text"
                    >
                      {t({ id: 'button.emailLink', message: 'Email me a link' })}
                    </LoadingButton>
                  );
                case B2BProducts.emailOtp:
                  return (
                    <LoadingButton
                      key={product}
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'set_user_supplied_email', email });
                        stytchOtpLoginOrSignup({ email, organization_id: organization.organization_id });
                      }}
                      isLoading={otpIsMutating}
                      disabled={isMutating}
                      variant="text"
                    >
                      {t({ id: 'button.emailCode', message: 'Email me a code' })}
                    </LoadingButton>
                  );
              }
            })}
        </Flex>
        {showPasswordButton && <PasswordUseButton email={email} />}
      </Flex>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={12}>
        <Flex direction="column" gap={8}>
          <Flex direction="column" minHeight={52}>
            <EmailInput email={email} setEmail={setEmailInput} aria-label={emailInputLabel} {...emailProps.input} />
            {error && (
              <ErrorText
                errorMessage={parseErrorMessage(error, { email, org: organization.organization_name })}
                {...emailProps.error}
              />
            )}
          </Flex>
          <SubmitButton
            isSubmitting={isMutating}
            text={t({ id: 'button.continueWithEmail', message: 'Continue with email' })}
          />
        </Flex>
        {showPasswordButton && <PasswordUseButton email={email} />}
      </Flex>
    </form>
  );
};

export const EmailDiscoveryForm = ({ showPasswordButton }: { showPasswordButton: boolean }) => {
  const [state, dispatch] = useGlobalReducer();
  const [email, setEmail] = useState(state.formState.passwordState.email);
  const { t } = useLingui();

  const { products } = useEffectiveAuthConfig();
  const enableEml = products.includes(B2BProducts.emailMagicLinks);
  const enableOtp = products.includes(B2BProducts.emailOtp);

  const { trigger: stytchEmlDiscoverySend, error: emlError, isMutating: emlIsMutating } = useEmlDiscoverySend();
  const { trigger: stytchOtpDiscoverySend, error: otpError, isMutating: otpIsMutating } = useEmailOtpDiscoverySend();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: 'set_user_supplied_email', email });

    if (enableEml && enableOtp) {
      dispatch({ type: 'transition', screen: AppScreens.EmailMethodSelection, history: 'push' });
    } else if (enableEml) {
      stytchEmlDiscoverySend({ email });
    } else if (enableOtp) {
      stytchOtpDiscoverySend({ email });
    }
  };

  const isMutating = emlIsMutating || otpIsMutating;
  const error = emlError || otpError;
  const emailProps = useErrorProps(error);
  const emailInputLabel = t({ id: 'formField.email.label', message: 'Email' });

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={12}>
        <Flex direction="column" gap={8}>
          <Flex direction="column" minHeight={52}>
            <EmailInput email={email} setEmail={setEmail} aria-label={emailInputLabel} {...emailProps.input} />
            {error && <ErrorText errorMessage={getTranslatedError(error, t)} {...emailProps.error} />}
          </Flex>
          <SubmitButton
            isSubmitting={isMutating}
            text={t({ id: 'button.continueWithEmail', message: 'Continue with email' })}
          />
        </Flex>
        {showPasswordButton && <PasswordUseButton email={email} />}
      </Flex>
    </form>
  );
};
