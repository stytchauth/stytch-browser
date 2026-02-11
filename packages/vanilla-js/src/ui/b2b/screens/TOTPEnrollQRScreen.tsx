import { B2BTOTPCreateResponse, StytchAPIError } from '@stytch/core/public';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import Button from '../../components/Button';
import { Flex } from '../../components/Flex';
import { LoadingScreen } from '../../components/Loading';
import { Text } from '../../components/Text';
import { useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { StytchMutationKey, useMutate } from '../utils';
import { useLingui } from '@lingui/react/macro';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import BackArrow from '../../../assets/backArrow';
import { AppScreens } from '../types/AppScreens';

const QRCodeImg = styled.img`
  margin: 0 auto;
`;

export const TOTPEnrollQRScreen = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const { t } = useLingui();
  const {
    mfa: {
      totp: { createError, enrollment, isCreating },
    },
  } = state;

  // This screen should only be shown if primary info and TOTP enrollment are
  // available
  const { memberId, organizationId } = state.mfa.primaryInfo!;

  const { trigger: createTotp } = useMutate<
    B2BTOTPCreateResponse,
    unknown,
    StytchMutationKey,
    { memberId: string; organizationId: string }
  >(
    'stytch.totp.create',
    (_: string, { arg: { memberId, organizationId } }: { arg: { memberId: string; organizationId: string } }) => {
      dispatch({ type: 'totp/create' });
      return stytchClient.totp.create({ member_id: memberId, organization_id: organizationId });
    },
    {
      onSuccess: (response) => {
        dispatch({ type: 'totp/create_success', response, memberId, organizationId });
      },
      onError: (error) => {
        const message = getTranslatedError(error as StytchAPIError, t);
        if (message) {
          toast.error(message);
        }
        dispatch({ type: 'totp/create_error', error });
      },
    },
  );

  const shouldCreate = !enrollment && !isCreating && !createError;
  useEffect(() => {
    if (shouldCreate) {
      createTotp({ memberId, organizationId });
    }
  }, [createTotp, memberId, organizationId, shouldCreate]);

  const handleShowManualCode = () => {
    dispatch({ type: 'totp/show_code', method: 'manual' });
  };

  const handleContinue = () => {
    dispatch({ type: 'transition', history: 'push', screen: AppScreens.TOTPEntry });
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrow onClick={() => dispatch({ type: 'navigate_back' })} />
      <Text size="header">
        {t({ id: 'totp.setupQr.title', message: 'Scan the QR code to link your authenticator app' })}
      </Text>
      <Text>
        {t({
          id: 'totp.setupQr.content',
          message:
            'Your organization requires an additional form of verification to make your account more secure. If you don’t have an authenticator app, you’ll need to install one first.',
        })}
      </Text>
      {enrollment ? (
        <>
          <QRCodeImg
            alt={t({ id: 'mfaTotpEnrollment.qrAltText', message: 'QR code for TOTP enrollment' })}
            src={enrollment.qrCode}
          />
          <Button type="button" variant="text" onClick={handleShowManualCode}>
            {t({ id: 'button.totpQrManual', message: 'Having trouble scanning?' })}
          </Button>
          <Button type="button" onClick={handleContinue}>
            {t({ id: 'button.continue', message: 'Continue' })}
          </Button>
        </>
      ) : (
        <LoadingScreen />
      )}
    </Flex>
  );
};
