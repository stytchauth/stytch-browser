import { useLingui } from '@lingui/react/macro';
import { StytchAPIError } from '@stytch/core/public';
import React, { useState } from 'react';

import { getTranslatedError } from '../../../utils/getTranslatedError';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import EmailInput from '../../components/molecules/EmailInput';
import UsePasswordButton from '../components/UsePasswordButton';
import { useGlobalReducer } from '../GlobalContextProvider';
import { useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';
import { useEmailOtpDiscoverySend } from '../hooks/useEmailOtpDiscoverySend';
import { useEmailOtpLoginOrSignup } from '../hooks/useEmailOtpLoginOrSignup';
import { useEmlDiscoverySend } from '../hooks/useEmlDiscoverySend';
import { useEmlLoginOrSignup } from '../hooks/useEmlLoginOrSignup';
import { AppScreens } from '../types/AppScreens';
import { hasProduct } from '../utils';

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
  const enableEml = hasProduct(products, 'emailMagicLinks');
  const enableOtp = hasProduct(products, 'emailOtp');

  const providedEmail = state.primary.email;
  const email = providedEmail || emailInput;

  const { trigger: stytchEmlLoginOrSignup, error: emlError, isMutating: emlIsMutating } = useEmlLoginOrSignup();
  const { trigger: stytchOtpLoginOrSignup, error: otpError, isMutating: otpIsMutating } = useEmailOtpLoginOrSignup();

  const isMutating = emlIsMutating || otpIsMutating;
  const error = emlError || otpError;

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
      <Column gap={2}>
        {products
          .filter((product) => product.id === 'emailMagicLinks' || product.id === 'emailOtp')
          .map((product) => {
            switch (product.id) {
              case 'emailMagicLinks':
                return (
                  <Button
                    key={product.id}
                    onClick={() => {
                      dispatch({ type: 'set_user_supplied_email', email });
                      stytchEmlLoginOrSignup({ email, organization_id: organization.organization_id });
                    }}
                    loading={emlIsMutating}
                    disabled={isMutating}
                    variant="outline"
                  >
                    {t({ id: 'button.emailLink', message: 'Email me a link' })}
                  </Button>
                );

              case 'emailOtp':
                return (
                  <Button
                    key={product.id}
                    onClick={() => {
                      dispatch({ type: 'set_user_supplied_email', email });
                      stytchOtpLoginOrSignup({ email, organization_id: organization.organization_id });
                    }}
                    loading={otpIsMutating}
                    disabled={isMutating}
                    variant="outline"
                  >
                    {t({ id: 'button.emailCode', message: 'Email me a code' })}
                  </Button>
                );
            }
          })}

        {showPasswordButton && <UsePasswordButton email={email} />}
      </Column>
    );
  }

  return (
    <Column as="form" onSubmit={handleSubmit} gap={2}>
      <EmailInput
        email={email}
        setEmail={setEmailInput}
        hideLabel
        error={error ? parseErrorMessage(error, { email, org: organization.organization_name }) : undefined}
      />

      <Button type="submit" variant="primary" loading={isMutating}>
        {t({ id: 'button.continueWithEmail', message: 'Continue with email' })}
      </Button>

      {showPasswordButton && <UsePasswordButton email={email} />}
    </Column>
  );
};

export const EmailDiscoveryForm = ({ showPasswordButton }: { showPasswordButton: boolean }) => {
  const [state, dispatch] = useGlobalReducer();
  const [email, setEmail] = useState(state.formState.passwordState.email);
  const { t } = useLingui();

  const { products } = useEffectiveAuthConfig();
  const enableEml = products.some((p) => p.id === 'emailMagicLinks');
  const enableOtp = products.some((p) => p.id === 'emailOtp');

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

  return (
    <Column as="form" onSubmit={handleSubmit} gap={2}>
      <EmailInput
        email={email}
        setEmail={setEmail}
        hideLabel
        error={error ? getTranslatedError(error, t) : undefined}
      />

      <Button type="submit" variant="primary" loading={isMutating}>
        {t({ id: 'button.continueWithEmail', message: 'Continue with email' })}
      </Button>

      {showPasswordButton && <UsePasswordButton email={email} />}
    </Column>
  );
};
