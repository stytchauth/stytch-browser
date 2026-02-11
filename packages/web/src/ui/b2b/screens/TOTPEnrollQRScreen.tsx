import { useLingui } from '@lingui/react/macro';
import { B2BTOTPCreateResponse, StytchAPIError } from '@stytch/core/public';
import React, { useEffect } from 'react';

import { getTranslatedError } from '../../../utils/getTranslatedError';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import { errorToast } from '../../components/atoms/Toast';
import Typography from '../../components/atoms/Typography';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import { LoadingScreen } from '../../components/molecules/Loading';
import { useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { StytchMutationKey, useMutate } from '../utils';
import styles from './TOTPEnrollQRScreen.module.css';

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
          errorToast({ message });
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
    <Column gap={6}>
      <Typography variant="header">
        {t({ id: 'totp.setupQr.title', message: 'Scan the QR code to link your authenticator app' })}
      </Typography>

      <Typography variant="body">
        {t({
          id: 'totp.setupQr.content',
          message:
            'Your organization requires an additional form of verification to make your account more secure. If you don’t have an authenticator app, you’ll need to install one first.',
        })}
      </Typography>

      {enrollment ? (
        <>
          <img
            alt={t({ id: 'mfaTotpEnrollment.qrAltText', message: 'QR code for TOTP enrollment' })}
            src={enrollment.qrCode}
            className={styles.qr}
          />

          <ButtonColumn>
            <Button variant="primary" onClick={handleContinue}>
              {t({ id: 'button.continue', message: 'Continue' })}
            </Button>
            <Button variant="outline" onClick={handleShowManualCode}>
              {t({ id: 'button.totpQrManual', message: 'Having trouble scanning?' })}
            </Button>
          </ButtonColumn>
        </>
      ) : (
        <LoadingScreen />
      )}
    </Column>
  );
};
