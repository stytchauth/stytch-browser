import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { StringLiteralFromEnum } from '@stytch/core';
import { B2BMFAProducts } from '@stytch/core/public';
import React, { useMemo } from 'react';

import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import { getEnabledMethods } from '../getEnabledMethods';
import { useConfig, useGlobalReducer } from '../GlobalContextProvider';
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

  const handleNavigate = (screen: AppScreens) => {
    dispatch({
      type: 'transition',
      screen,
      history: 'push',
    });
  };

  const displayOptions = useMemo(() => {
    const optionsToDisplay = getEnabledMethods({
      allMethods: B2B_MFA_METHODS,
      orgSupportedMethods: organizationMfaOptionsSupported,
      uiIncludedMethods: mfaProductInclude,
    });

    const result: StringLiteralFromEnum<B2BMFAProducts>[] = [];
    for (const option of mfaProductOrder ?? B2B_MFA_METHODS) {
      if (optionsToDisplay.has(option)) {
        result.push(option);
        optionsToDisplay.delete(option);
      }
    }

    result.push(...optionsToDisplay);
    return result;
  }, [mfaProductInclude, mfaProductOrder, organizationMfaOptionsSupported]);

  return (
    <Column gap={6}>
      <Typography variant="header">
        {t({ id: 'mfa.enrollment.title', message: 'Set up Multi-Factor Authentication' })}
      </Typography>

      <Typography variant="body">
        {t({
          id: 'mfa.enrollment.content',
          message: 'Your organization requires an additional form of verification to make your account more secure.',
        })}
      </Typography>

      <ButtonColumn>
        {displayOptions.map((option) => {
          const { messageDescriptor, screen } = mfaOptions[option];
          return (
            <Button key={option} variant="outline" onClick={() => handleNavigate(screen)}>
              {t(messageDescriptor)}
            </Button>
          );
        })}
      </ButtonColumn>
    </Column>
  );
};
