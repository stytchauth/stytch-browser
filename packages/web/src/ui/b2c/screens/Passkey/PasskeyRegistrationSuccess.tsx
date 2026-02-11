import { useLingui } from '@lingui/react/macro';
import { logger } from '@stytch/core';
import { errorToStytchError, StytchEventType, WebAuthnRegistration } from '@stytch/core/public';
import React, { useState } from 'react';

import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import { errorToast } from '../../../components/atoms/Toast';
import Typography from '../../../components/atoms/Typography';
import ButtonColumn from '../../../components/molecules/ButtonColumn';
import ErrorText from '../../../components/molecules/ErrorText';
import { useStytchUser } from '../../../hooks/useStytchUser';
import { AppScreens, useEventCallback, useGlobalReducer, useStytch } from '../../GlobalContextProvider';
import { EditableRow, EditableRowState } from './EditableRow';
import styles from './PasskeyRegistrationSuccess.module.css';

// TODO: Add some type of device icon once we have better insight into that.
// const deviceTypeToIcon: Partial<Record<Device, React.JSX.Element>> = {
//   [Device.DESKTOP]: <Computer />,
//   [Device.MOBILE]: <Mobile />,
// };

type OptimisticUpdate = {
  registrations: WebAuthnRegistration[];
  update: Promise<unknown>;
};

export const PasskeyRegistrationSuccess = () => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const user = useStytchUser();

  const [optimisticRegistrations, setOptimisticRegistrations] = useState<OptimisticUpdate>();
  const webAuthnRegistrations = optimisticRegistrations?.registrations ?? user?.webauthn_registrations;

  const [editableRowState, setEditableRowState] = useState<EditableRowState>({ type: 'viewing' });

  const onEvent = useEventCallback();
  const [, dispatch] = useGlobalReducer();

  const onSetUpANewPasskey = async () => {
    await optimisticRegistrations?.update;
    dispatch({ type: 'transition', screen: AppScreens.PasskeyRegistrationStart });
  };

  const onDone = async () => {
    await optimisticRegistrations?.update;
    onEvent({ type: StytchEventType.PasskeyDone, data: {} });
  };

  const startOptimisticUpdate = (registrations: WebAuthnRegistration[], update: Promise<unknown>) => {
    const prevEditableRowState = { ...editableRowState };

    setOptimisticRegistrations({ registrations, update });
    setEditableRowState({ type: 'viewing' });

    update
      .catch((error) => {
        logger.error(error);
        errorToast({ message: errorToStytchError(error).message });
        setEditableRowState(prevEditableRowState);
      })
      .then(() => {
        setOptimisticRegistrations(undefined);
      });
  };

  const deleteReg = (id: string) => {
    if (!user) return;

    startOptimisticUpdate(
      user.webauthn_registrations.filter((r) => r.webauthn_registration_id !== id),
      stytchClient.user.deleteWebauthnRegistration(id),
    );
  };

  const updateReg = (id: string, name: string) => {
    if (!user) return;

    startOptimisticUpdate(
      user.webauthn_registrations.map((r) => (r.webauthn_registration_id === id ? { ...r, name } : r)),
      stytchClient.webauthn.update({ webauthn_registration_id: id, name }).then(() => stytchClient.user.get()),
    );
  };

  return (
    <Column gap={6}>
      <Typography variant="header">
        {t({
          id: 'passkey.registrationSuccess.title',
          message: 'Passkey successfully created!',
        })}
      </Typography>

      {webAuthnRegistrations && webAuthnRegistrations.length > 0 && (
        <Column gap={4}>
          <Typography weight="medium">
            {t({
              id: 'passkey.registrationSuccess.existingPasskeys',
              message: 'Existing Passkeys',
            })}
          </Typography>

          <Column className={styles.existing}>
            {webAuthnRegistrations.map((registration: WebAuthnRegistration) => (
              // TODO: Add some type of device icon once we have better insight into that.
              // deviceTypeToIcon[determineDeviceType(registration.user_agent)]
              <EditableRow
                className={styles.passkeyRow}
                key={registration.webauthn_registration_id}
                id={registration.webauthn_registration_id}
                name={registration.name}
                state={editableRowState}
                updateState={setEditableRowState}
                handleEdit={updateReg}
              />
            ))}
          </Column>
        </Column>
      )}

      <ButtonColumn>
        {editableRowState.type === 'deleting' ? (
          <>
            <Button
              variant="destructive"
              onClick={() => {
                deleteReg(editableRowState.id);
              }}
            >
              {t({
                id: 'button.delete',
                message: 'Delete',
              })}
            </Button>

            <ErrorText
              // alert role to ensure this gets read out when the row delete button is clicked
              role="alert"
            >
              {t({
                id: 'passkey.registrationSuccess.deleteWarning',
                message: 'Once deleted, the passkey cannot be restored.',
              })}
            </ErrorText>

            <Button
              variant="ghost"
              onClick={() => {
                setEditableRowState({ type: 'viewing' });
              }}
            >
              {t({
                id: 'button.cancel',
                message: 'Cancel',
              })}
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" disabled={editableRowState.type === 'editing'} onClick={onSetUpANewPasskey}>
              {t({
                id: 'passkey.registrationSuccess.setupAnother',
                message: 'Set up another Passkey',
              })}
            </Button>

            <Button variant="ghost" disabled={editableRowState.type === 'editing'} onClick={onDone}>
              {t({
                id: 'button.done',
                message: 'Done',
              })}
            </Button>
          </>
        )}
      </ButtonColumn>
    </Column>
  );
};
