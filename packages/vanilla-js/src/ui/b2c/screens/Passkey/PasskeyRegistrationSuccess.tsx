import React, { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { logger } from '@stytch/core';
import { errorToStytchError, StytchEventType, WebAuthnRegistration } from '@stytch/core/public';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { AppScreens, useEventCallback, useGlobalReducer, useStytch } from '../../GlobalContextProvider';
import { useStytchUser } from '../../../hooks/useStytchUser';
import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import Button from '../../../components/Button';
import { EditableRow, EditableRowState } from './EditableRow';
import { AlertBox } from '../../../components/AlertBox';
import { PasskeyAddedSvg } from '../../../../assets/passkeyAdded';

const SubHeading = styled(Text)`
   {
    font-weight: 700;
    text-transform: uppercase;
  }
`;

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
        toast.error(errorToStytchError(error).message);
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
    <Flex direction="column" gap={36} marginTop={12} marginLeft={6.5} marginRight={6.5}>
      <Text size="header">
        {t({
          id: 'passkey.registrationSuccess.title',
          message: 'Passkey successfully created!',
        })}
      </Text>

      <Flex alignSelf="center">
        <PasskeyAddedSvg />
      </Flex>

      {webAuthnRegistrations && webAuthnRegistrations.length > 0 && (
        <Flex align-items="left" direction="column" width="100%" gap={8}>
          <SubHeading size="body">
            {t({
              id: 'passkey.registrationSuccess.existingPasskeys',
              message: 'Existing Passkeys',
            })}
          </SubHeading>

          {webAuthnRegistrations.map((registration: WebAuthnRegistration) => (
            // TODO: Add some type of device icon once we have better insight into that.
            // deviceTypeToIcon[determineDeviceType(registration.user_agent)]
            <EditableRow
              key={registration.webauthn_registration_id}
              id={registration.webauthn_registration_id}
              name={registration.name}
              state={editableRowState}
              updateState={setEditableRowState}
              handleEdit={updateReg}
            />
          ))}
        </Flex>
      )}

      <Flex direction="column" gap={12}>
        {editableRowState.type === 'deleting' ? (
          <>
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                deleteReg(editableRowState.id);
              }}
            >
              {t({
                id: 'button.delete',
                message: 'Delete',
              })}
            </Button>

            <Button
              type="button"
              variant="text"
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
            <Button type="button" disabled={editableRowState.type === 'editing'} onClick={onSetUpANewPasskey}>
              {t({
                id: 'passkey.registrationSuccess.setupAnother',
                message: 'Set up another Passkey',
              })}
            </Button>

            <Button type="button" variant="text" disabled={editableRowState.type === 'editing'} onClick={onDone}>
              {t({
                id: 'button.done',
                message: 'Done',
              })}
            </Button>
          </>
        )}
      </Flex>

      {editableRowState.type === 'deleting' && (
        <AlertBox
          variant="error"
          text={t({
            id: 'passkey.registrationSuccess.deleteWarning',
            message: 'Once deleted, the passkey cannot be restored.',
          })}
        />
      )}
    </Flex>
  );
};
