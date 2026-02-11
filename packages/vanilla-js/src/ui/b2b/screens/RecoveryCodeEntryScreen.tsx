import { RecoveryCodeRecoverResponse, StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { FormEvent, useState } from 'react';
import BackArrow from '../../../assets/backArrow';
import { ErrorText } from '../../components/ErrorText';
import { Flex } from '../../components/Flex';
import { Input } from '../../components/Input';
import { SubmitButton } from '../../components/SubmitButton';
import { Text } from '../../components/Text';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { StytchMutationKey, useMutate } from '../utils';
import { useLingui } from '@lingui/react/macro';
import { useErrorProps } from '../../../utils/accessibility';

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
      onSuccess: () => {
        dispatch({ type: 'recovery_code/authenticate_success' });
      },
    },
  );

  const [recoveryCode, setRecoveryCode] = useState('');
  const recoveryCodeProps = useErrorProps(error);

  const errorMessage = error
    ? t({ id: 'recoveryCodes.entry.error.invalidCode', message: 'Invalid backup code, please try again.' })
    : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    authenticate({ recoveryCode, memberId, organizationId, sessionDurationMinutes });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={24}>
        <BackArrow onClick={() => dispatch({ type: 'navigate_back' })} />
        <Text size="header">{t({ id: 'recoveryCodes.entry.title', message: 'Enter backup code' })}</Text>
        <Text>
          {t({
            id: 'recoveryCodes.entry.content',
            message: 'Enter one of the backup codes you saved when setting up your authenticator app.',
          })}
        </Text>
        <Flex direction="column">
          <Input
            value={recoveryCode}
            onChange={(e) => {
              setRecoveryCode(e.target.value);
            }}
            placeholder={t({ id: 'formField.backupCode.placeholder', message: 'Enter backup code' })}
            aria-label={t({ id: 'formField.backupCode.ariaLabel', message: 'Backup code' })}
            required
            autoComplete="off"
            {...recoveryCodeProps.input}
          />
          {errorMessage && <ErrorText errorMessage={errorMessage} {...recoveryCodeProps.error} />}
        </Flex>
        <SubmitButton
          text={t({ id: 'button.continue', message: 'Continue' })}
          disabled={!recoveryCode}
          isSubmitting={isSubmitting}
        />
      </Flex>
    </form>
  );
};
