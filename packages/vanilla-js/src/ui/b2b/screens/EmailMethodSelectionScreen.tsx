import { StringLiteralFromEnum } from '@stytch/core';
import { AuthFlowType, B2BProducts } from '@stytch/core/public';
import React, { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { MessageDescriptor } from '@lingui/core';
import BackArrow from '../../../assets/backArrow';
import { ErrorText } from '../../components/ErrorText';
import { Flex } from '../../components/Flex';
import { MenuButton } from '../../components/MenuButton';
import { Text } from '../../components/Text';
import { useGlobalReducer } from '../GlobalContextProvider';
import { useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';
import { useEmailOtpDiscoverySend } from '../hooks/useEmailOtpDiscoverySend';
import { useEmailOtpLoginOrSignup } from '../hooks/useEmailOtpLoginOrSignup';
import { useEmlDiscoverySend } from '../hooks/useEmlDiscoverySend';
import { useEmlLoginOrSignup } from '../hooks/useEmlLoginOrSignup';
import { getTranslatedError } from '../../../utils/getTranslatedError';

const options = {
  [B2BProducts.emailMagicLinks]: {
    messageDescriptor: msg({ id: 'emailMethodSelection.link', message: 'Email me a log in link' }),
  },
  [B2BProducts.emailOtp]: {
    messageDescriptor: msg({ id: 'emailMethodSelection.code', message: 'Email me a log in code' }),
  },
} as const satisfies Partial<Record<StringLiteralFromEnum<B2BProducts>, { messageDescriptor: MessageDescriptor }>>;

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

  const handleChooseMethod = (method: StringLiteralFromEnum<B2BProducts>) => {
    resetSendDiscoveryEml();
    resetSendDiscoveryOtp();
    resetSendLoginOrSignupEml();
    resetSendLoginOrSignupOtp();

    switch (method) {
      case B2BProducts.emailMagicLinks:
        if (state.flowState.type === AuthFlowType.Discovery) {
          sendDiscoveryEml({ email: state.formState.emailState.userSuppliedEmail });
        } else if (state.flowState.type === AuthFlowType.Organization && state.flowState.organization) {
          sendLoginOrSignupEml({
            email: state.formState.emailState.userSuppliedEmail,
            organization_id: state.flowState.organization.organization_id,
          });
        }
        break;
      case B2BProducts.emailOtp:
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

  const displayOptions = useMemo(() => {
    return products
      .filter((product): product is keyof typeof options => product in options)
      .map((product) => {
        const option = options[product];

        return { option: product, messageDescriptor: option.messageDescriptor };
      });
  }, [products]);

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrow onClick={handleBack} />
      <Text size="header">
        {t({ id: 'emailMethodSelection.title', message: 'Select how you’d like to continue.' })}
      </Text>
      <Flex direction="column">
        {displayOptions.map(({ option, messageDescriptor }) => (
          <MenuButton
            key={option}
            disabled={isSending}
            onClick={() => {
              handleChooseMethod(option);
            }}
          >
            {t(messageDescriptor)}
          </MenuButton>
        ))}
      </Flex>
      {error && <ErrorText errorMessage={getTranslatedError(error, t)} />}
    </Flex>
  );
};
