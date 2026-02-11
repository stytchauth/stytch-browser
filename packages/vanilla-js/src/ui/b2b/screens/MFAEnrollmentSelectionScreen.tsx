import { StringLiteralFromEnum } from '@stytch/core';
import { B2BMFAProducts } from '@stytch/core/public';
import React, { useMemo } from 'react';
import { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { Flex } from '../../components/Flex';
import { MenuButton } from '../../components/MenuButton';
import { Text } from '../../components/Text';
import { useConfig, useGlobalReducer } from '../GlobalContextProvider';
import { getEnabledMethods } from '../getEnabledMethods';
import { B2B_MFA_METHODS } from '../reducer/mfa';
import { AppScreens } from '../types/AppScreens';

const mfaOptions: Record<
  StringLiteralFromEnum<B2BMFAProducts>,
  {
    messageDescriptor: MessageDescriptor;
    screen: AppScreens;
  }
> = {
  [B2BMFAProducts.totp]: {
    messageDescriptor: msg({ id: 'mfa.enrollment.option.totp', message: 'Use an authenticator app' }),
    screen: AppScreens.TOTPEnrollmentQRCode,
  },
  [B2BMFAProducts.smsOtp]: {
    messageDescriptor: msg({ id: 'mfa.enrollment.option.sms', message: 'Text me a code' }),
    screen: AppScreens.SMSOTPEnrollment,
  },
};

export const MFAEnrollmentSelectionScreen = () => {
  const { t } = useLingui();
  const { mfaProductInclude, mfaProductOrder } = useConfig();

  const [state, dispatch] = useGlobalReducer();

  // This screen should only be shown if primary info is available
  const { organizationMfaOptionsSupported } = state.mfa.primaryInfo!;

  const handleChooseMethod = (method: StringLiteralFromEnum<B2BMFAProducts>) => {
    dispatch({
      type: 'transition',
      screen: mfaOptions[method].screen,
      history: 'push',
    });
  };

  const displayOptions = useMemo(() => {
    const optionsToDisplay = getEnabledMethods({
      allMethods: B2B_MFA_METHODS,
      orgSupportedMethods: organizationMfaOptionsSupported,
      uiIncludedMethods: mfaProductInclude,
    });

    const sortedOptions = (mfaProductOrder ?? B2B_MFA_METHODS).reduce<
      { option: StringLiteralFromEnum<B2BMFAProducts>; messageDescriptor: MessageDescriptor }[]
    >((acc, cur) => {
      if (optionsToDisplay.has(cur)) {
        acc.push({ option: cur, messageDescriptor: mfaOptions[cur].messageDescriptor });
        optionsToDisplay.delete(cur);
      }
      return acc;
    }, []);

    // append remaining options
    optionsToDisplay.forEach((option) => {
      sortedOptions.push({ option, messageDescriptor: mfaOptions[option].messageDescriptor });
    });

    return sortedOptions;
  }, [mfaProductInclude, mfaProductOrder, organizationMfaOptionsSupported]);

  return (
    <Flex direction="column" gap={24}>
      <Text size="header">{t({ id: 'mfa.enrollment.title', message: 'Set up Multi-Factor Authentication' })}</Text>
      <Text>
        {t({
          id: 'mfa.enrollment.content',
          message: 'Your organization requires an additional form of verification to make your account more secure.',
        })}
      </Text>
      <Flex direction="column">
        {displayOptions.map(({ option, messageDescriptor }) => (
          <MenuButton
            key={option}
            onClick={() => {
              handleChooseMethod(option);
            }}
          >
            {t(messageDescriptor)}
          </MenuButton>
        ))}
      </Flex>
    </Flex>
  );
};
