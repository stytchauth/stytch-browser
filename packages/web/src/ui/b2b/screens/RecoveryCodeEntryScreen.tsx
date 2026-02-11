import { useLingui } from '@lingui/react/macro';
import { RecoveryCodeRecoverResponse, StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { FormEvent, useState } from 'react';

import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import Input from '../../components/molecules/Input';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { StytchMutationKey, useMutate } from '../utils';
import styles from './RecoveryCodeEntryScreen.module.css';

export const RecoveryCodeEntryScreen = () => {
  const stytchClient = useStytch();
  const {
    sessionOptions: { sessionDurationMinutes },
  } = useConfig();
  const { t } = useLingui();

  const [state, dispatch] = useGlobalReducer();

  // This screen should only be shown if primary info is available
  const { memberId, organizationId } = state.mfa.primaryInfo!;

  const {
    trigger: authenticate,
    isMutating: isSubmitting,
    error,
  } = useMutate<
    RecoveryCodeRecoverResponse<StytchProjectConfigurationInput>,
    unknown,
    StytchMutationKey,
    { recoveryCode: string; memberId: string; organizationId: string; sessionDurationMinutes: number }
  >(
    'stytch.recoveryCodes.recover',
    (
      _: string,
      {
        arg: { recoveryCode, memberId, organizationId, sessionDurationMinutes },
      }: { arg: { recoveryCode: string; memberId: string; organizationId: string; sessionDurationMinutes: number } },
    ) =>
      stytchClient.recoveryCodes.recover({
        recovery_code: recoveryCode,
        member_id: memberId,
        organization_id: organizationId,
        session_duration_minutes: sessionDurationMinutes,
      }),
    {
      throwOnError: false,
      onSuccess: () => {
        dispatch({ type: 'recovery_code/authenticate_success' });
      },
    },
  );

  const [recoveryCode, setRecoveryCode] = useState('');
  const errorMessage = error
    ? t({ id: 'recoveryCodes.entry.error.invalidCode', message: 'Invalid backup code, please try again.' })
    : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    authenticate({ recoveryCode, memberId, organizationId, sessionDurationMinutes });
  };

  return (
    <Column as="form" gap={6} onSubmit={handleSubmit}>
      <Typography variant="header">{t({ id: 'recoveryCodes.entry.title', message: 'Enter backup code' })}</Typography>
      <Typography variant="body">
        {t({
          id: 'recoveryCodes.entry.content',
          message: 'Enter one of the backup codes you saved when setting up your authenticator app.',
        })}
      </Typography>

      <Input
        id="recovery-code"
        className={styles.input}
        value={recoveryCode}
        onChange={(e) => {
          setRecoveryCode(e.target.value);
        }}
        placeholder={t({ id: 'formField.backupCode.placeholder', message: 'Enter backup code' })}
        label={t({ id: 'formField.backupCode.ariaLabel', message: 'Backup code' })}
        hideLabel
        required
        autoComplete="off"
        spellCheck={false}
        error={errorMessage}
      />

      <ButtonColumn>
        <Button variant="primary" loading={isSubmitting} type="submit" disabled={!recoveryCode || isSubmitting}>
          {t({ id: 'button.continue', message: 'Continue' })}
        </Button>
        <Button variant="ghost" onClick={() => dispatch({ type: 'navigate_back' })}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
