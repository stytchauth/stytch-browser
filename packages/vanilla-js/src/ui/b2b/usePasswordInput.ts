import { useState } from 'react';
import { useConfig, useErrorCallback, useEventCallback, useGlobalReducer, useStytch } from './GlobalContextProvider';
import { AppScreens } from './types/AppScreens';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import { readB2BInternals } from '../../utils/internal';
import { OrganizationBySlugMatch } from '@stytch/core/public';
import { DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { B2BSubscriptionDataLayer } from '../../SubscriptionService';
import { useLingui } from '@lingui/react/macro';
import { getTranslatedError } from '../../utils/getTranslatedError';
import { onAuthenticateSuccess } from './utils';

export const usePasswordInput = () => {
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const stytch = useStytch();
  const { t } = useLingui();

  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const [email, setEmail] = useState(state.formState.passwordState.email);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const organization = state.flowState.organization;

  const submitPassword = (organization_id: string) => {
    setErrorMessage('');
    setIsSubmitting(true);
    stytch.passwords
      .authenticate({
        email_address: email,
        organization_id: organization_id,
        password: password,
        session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
        locale: config.passwordOptions?.locale,
      })
      .then((data) => {
        setIsSubmitting(false);
        onEvent({ type: StytchEventType.B2BPasswordAuthenticate, data });
        onAuthenticateSuccess(data, dispatch, config);
      })
      .catch((err: StytchAPIError) => {
        setIsSubmitting(false);
        onError(err);
        setErrorMessage(getTranslatedError(err, t));
      });
  };

  const submitDiscoveryPassword = () => {
    setErrorMessage('');
    setIsSubmitting(true);
    stytch.passwords.discovery
      .authenticate({
        email_address: email,
        password: password,
      })
      .then((data) => {
        setIsSubmitting(false);
        onEvent({ type: StytchEventType.B2BPasswordDiscoveryAuthenticate, data });
        dispatch({ type: 'transition', screen: AppScreens.Discovery });
        dispatch({
          type: 'set_discovery_state',
          email: data.email_address,
          discoveredOrganizations: data.discovered_organizations,
        });
      })
      .catch((err: StytchAPIError) => {
        setIsSubmitting(false);
        onError(err);
        setErrorMessage(getTranslatedError(err, t));
      });
  };

  const emailEligibleForJITProvisioning = (
    { email_jit_provisioning, email_allowed_domains }: OrganizationBySlugMatch,
    email: string,
  ) => {
    switch (email_jit_provisioning) {
      case 'ALL_ALLOWED':
        return true;
      case 'NOT_ALLOWED':
        return false;
      case 'RESTRICTED': {
        const emailDomain = email.split('@').pop();
        return emailDomain != null && email_allowed_domains.includes(emailDomain);
      }
    }
  };

  const handleNonMemberReset = () => {
    if (!organization) {
      return;
    }

    if (!emailEligibleForJITProvisioning(organization, email)) {
      setIsSubmitting(false);
      const organizationName = organization.organization_name;
      setErrorMessage(
        t({
          id: 'error.emailNoAccessToOrg',
          message: `${email} does not have access to ${organizationName}. If you think this is a mistake, contact your admin.`,
        }),
      );
      return;
    }

    const dataLayer = readB2BInternals(stytch).dataLayer as B2BSubscriptionDataLayer;
    dataLayer.setItem('reset-email-value', email);
    stytch.magicLinks.email
      .loginOrSignup({
        email_address: email,
        organization_id: organization.organization_id,
        login_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
        signup_redirect_url: config.passwordOptions?.resetPasswordRedirectURL,
        login_template_id: config.emailMagicLinksOptions?.loginTemplateId,
        signup_template_id: config.emailMagicLinksOptions?.signupTemplateId,
        locale: config.emailMagicLinksOptions?.locale,
      })
      .then(() => {
        setIsSubmitting(false);
        dispatch({ type: 'set_password_state', email: email });
        dispatch({ type: 'transition', screen: AppScreens.PasswordResetVerifyConfirmation });
      })
      .catch((err: StytchAPIError) => {
        onError(err);
        setErrorMessage(getTranslatedError(err, t));
        setIsSubmitting(false);
      });
  };

  return {
    stytch,
    onError,
    email,
    setEmail,
    password,
    setPassword,
    organization,
    errorMessage,
    setErrorMessage,
    isSubmitting,
    setIsSubmitting,
    submitPassword,
    submitDiscoveryPassword,
    handleNonMemberReset,
  };
};
