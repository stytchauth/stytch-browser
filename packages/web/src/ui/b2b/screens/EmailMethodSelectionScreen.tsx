import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { AuthFlowType } from '@stytch/core/public';
import React, { useMemo } from 'react';

import { getTranslatedError } from '../../../utils/getTranslatedError';
import { isTruthy } from '../../../utils/isTruthy';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import ErrorText from '../../components/molecules/ErrorText';
import { useGlobalReducer } from '../GlobalContextProvider';
import { useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';
import { useEmailOtpDiscoverySend } from '../hooks/useEmailOtpDiscoverySend';
import { useEmailOtpLoginOrSignup } from '../hooks/useEmailOtpLoginOrSignup';
import { useEmlDiscoverySend } from '../hooks/useEmlDiscoverySend';
import { useEmlLoginOrSignup } from '../hooks/useEmlLoginOrSignup';
import { ProductId } from '../StytchB2BProduct';

const options: Partial<Record<ProductId, { messageDescriptor: MessageDescriptor }>> = {
  emailMagicLinks: {
    messageDescriptor: msg({ id: 'emailMethodSelection.link', message: 'Email me a login link' }),
  },
  emailOtp: {
    messageDescriptor: msg({ id: 'emailMethodSelection.code', message: 'Email me a login code' }),
  },
};

export const EmailMethodSelectionScreen = () => {
  const { products } = useEffectiveAuthConfig();
  const { t } = useLingui();

  const [state, dispatch] = useGlobalReducer();

  const {
    trigger: sendDiscoveryEml,
    isMutating: isSendingDiscoveryEml,
    error: sendDiscoveryEmlError,
    reset: resetSendDiscoveryEml,
  } = useEmlDiscoverySend();

  const {
    trigger: sendDiscoveryOtp,
    isMutating: isSendingDiscoveryOtp,
    error: sendDiscoveryOtpError,
    reset: resetSendDiscoveryOtp,
  } = useEmailOtpDiscoverySend();

  const {
    trigger: sendLoginOrSignupEml,
    isMutating: isSendingLoginOrSignupEml,
    error: sendLoginOrSignupEmlError,
    reset: resetSendLoginOrSignupEml,
  } = useEmlLoginOrSignup();

  const {
    trigger: sendLoginOrSignupOtp,
    isMutating: isSendingLoginOrSignupOtp,
    error: sendLoginOrSignupOtpError,
    reset: resetSendLoginOrSignupOtp,
  } = useEmailOtpLoginOrSignup();

  const isSending =
    isSendingDiscoveryEml || isSendingDiscoveryOtp || isSendingLoginOrSignupEml || isSendingLoginOrSignupOtp;
  const error =
    sendDiscoveryEmlError || sendDiscoveryOtpError || sendLoginOrSignupEmlError || sendLoginOrSignupOtpError;

  const handleChooseMethod = (method: ProductId) => {
    resetSendDiscoveryEml();
    resetSendDiscoveryOtp();
    resetSendLoginOrSignupEml();
    resetSendLoginOrSignupOtp();

    switch (method) {
      case 'emailMagicLinks':
        if (state.flowState.type === AuthFlowType.Discovery) {
          sendDiscoveryEml({ email: state.formState.emailState.userSuppliedEmail });
        } else if (state.flowState.type === AuthFlowType.Organization && state.flowState.organization) {
          sendLoginOrSignupEml({
            email: state.formState.emailState.userSuppliedEmail,
            organization_id: state.flowState.organization.organization_id,
          });
        }
        break;
      case 'emailOtp':
        if (state.flowState.type === AuthFlowType.Discovery) {
          sendDiscoveryOtp({ email: state.formState.emailState.userSuppliedEmail });
        } else if (state.flowState.type === AuthFlowType.Organization && state.flowState.organization) {
          sendLoginOrSignupOtp({
            email: state.formState.emailState.userSuppliedEmail,
            organization_id: state.flowState.organization.organization_id,
          });
        }
        break;
    }
  };

  const displayOptions = useMemo(
    () =>
      products
        .map((product) => {
          const option = options[product.id];
          if (!option) return;

          return {
            option: product.id,
            messageDescriptor: option.messageDescriptor,
          };
        })
        .filter(isTruthy),
    [products],
  );

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  return (
    <Column gap={6}>
      <Typography variant="header">
        {t({ id: 'emailMethodSelection.title', message: 'Select how you’d like to continue' })}
      </Typography>
      <ButtonColumn>
        {displayOptions.map(({ option, messageDescriptor }) => (
          <Button
            key={option}
            variant="outline"
            disabled={isSending}
            onClick={() => {
              handleChooseMethod(option);
            }}
          >
            {t(messageDescriptor)}
          </Button>
        ))}

        {error && <ErrorText>{getTranslatedError(error, t)}</ErrorText>}

        <Button variant="ghost" onClick={handleBack}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
