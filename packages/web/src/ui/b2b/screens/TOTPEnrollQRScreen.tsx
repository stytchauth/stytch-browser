import { useLingui } from '@lingui/react/macro';
import { StytchAPIError, StytchError, StytchEventType } from '@stytch/core/public';
import React from 'react';
import useSWR from 'swr';

import { getTranslatedError } from '../../../utils/getTranslatedError';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import { errorToast } from '../../components/atoms/Toast';
import Typography from '../../components/atoms/Typography';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import { LoadingScreen } from '../../components/molecules/Loading';
import { useErrorCallback, useEventCallback, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import styles from './TOTPEnrollQRScreen.module.css';

export const TOTPEnrollQRScreen = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const { t } = useLingui();

  // This screen should only be shown if primary info and TOTP enrollment are
  // available
  const { memberId, organizationId } = state.mfa.primaryInfo!;

  const { data } = useSWR(
    ['stytch.totp.create', memberId, organizationId],
    () => stytchClient.totp.create({ member_id: memberId, organization_id: organizationId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,

      onSuccess: (response) => {
        onEvent({ type: StytchEventType.B2BTOTPCreate, data: response });
        // Store the enrollment object so we can show recovery code after authenticating
        dispatch({ type: 'totp/create_success', response, memberId, organizationId });
      },
      onError: (error) => {
        const message = getTranslatedError(error as StytchAPIError, t);
        if (message) {
          errorToast({ message });
        }
        onError(error as StytchError);
      },
    },
  );

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

      {data ? (
        <>
          <img
            alt={t({ id: 'mfaTotpEnrollment.qrAltText', message: 'QR code for TOTP enrollment' })}
            src={data.qr_code}
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
