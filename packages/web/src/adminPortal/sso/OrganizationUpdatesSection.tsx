import { Organization } from '@stytch/core/public';
import React, { SetStateAction, useCallback, useMemo } from 'react';

import { FlexBox } from '../components/FlexBox';
import {
  SetDefaultConfirmModal,
  useMutateDefaultConnection,
  useSetDefaultConnection,
} from '../components/SetDefaultConnection';
import { SettingsContainer, useSettingsContainer } from '../components/SettingsContainer';
import { SettingsSection } from '../components/SettingsSection';
import { Switch } from '../components/Switch';
import { Typography } from '../components/Typography';
import { useFormState } from '../utils/useFormState';
import { useMutateOrganization } from '../utils/useMutateOrganization';
import { useOrgInfo } from '../utils/useOrgInfo';
import { useRbac } from '../utils/useRbac';
import { useSsoRouterController } from './SSORouter';
import { TaggedConnection } from './TaggedConnection';

type JitProvisioningPolicy = Organization['sso_jit_provisioning'];

const OrganizationUpdatesSectionBody = ({
  connection,
  defaultConnectionName,
  orgJitProvisioningPolicy,
  localState,
  setLocalState,
  remoteState,
}: {
  connection: TaggedConnection;
  defaultConnectionName: string | undefined;
  orgJitProvisioningPolicy: JitProvisioningPolicy | undefined;
  localState: OrganizationUpdatesFormState;
  setLocalState: (state: SetStateAction<OrganizationUpdatesFormState>) => void;
  remoteState: OrganizationUpdatesFormState;
}) => {
  const { editing } = useSettingsContainer();

  const { handleRequestSetDefault, modalProps } = useSetDefaultConnection({ defaultConnectionName });

  const { isDefaultConnection, jitProvisioningEnabled } = editing ? localState : remoteState;

  const { data: canSetDefaultConnection } = useRbac('stytch.organization', 'update.settings.default-sso-connection');
  const { data: canSetSsoJitProvisioning } = useRbac('stytch.organization', 'update.settings.sso-jit-provisioning');

  const showSwitch = orgJitProvisioningPolicy === 'RESTRICTED';
  const jitProvisioningText = `JIT provisioning is ${
    orgJitProvisioningPolicy === 'ALL_ALLOWED' ? 'enabled' : 'disabled'
  } for all SSO connections.`;

  return (
    <FlexBox flexDirection="column" gap={2}>
      {editing && (
        <SetDefaultConfirmModal
          {...modalProps}
          confirm={() => {
            setLocalState((state) => ({ ...state, isDefaultConnection: true }));
            return Promise.resolve();
          }}
        />
      )}
      <SettingsSection
        title="Default SSO connection"
        tooltipText="The default SSO Connection is used to automatically initiate authentication for your Members when possible. If multiple active SSO Connections exist, Members will still have the option to login via non-default connections."
      >
        {remoteState.isDefaultConnection ? (
          <Typography variant="body2">This connection is already set as the default.</Typography>
        ) : (
          <Switch
            readOnly={!editing || !canSetDefaultConnection}
            label="Set this connection as the default SSO connection. This will replace your existing default SSO connection."
            checked={isDefaultConnection}
            onChange={() => {
              if (isDefaultConnection) {
                setLocalState((state) => ({ ...state, isDefaultConnection: false }));
              } else {
                handleRequestSetDefault({
                  displayName: connection.display_name,
                  id: connection.connection_id,
                });
              }
            }}
          />
        )}
      </SettingsSection>
      <SettingsSection
        title="JIT provisioning"
        tooltipText="If enabled, users who successfully authenticate through this SSO Connection will be automatically provisioned if they do not already have an account."
      >
        {showSwitch ? (
          <Switch
            readOnly={!editing || !canSetSsoJitProvisioning}
            label="Allow JIT provisioning for users who successfully authenticate through this SSO connection."
            checked={jitProvisioningEnabled}
            onChange={(value) => {
              setLocalState((state) => ({ ...state, jitProvisioningEnabled: value }));
            }}
          />
        ) : (
          <Typography variant="body2">{jitProvisioningText}</Typography>
        )}
      </SettingsSection>
    </FlexBox>
  );
};

interface OrganizationUpdatesFormState {
  isDefaultConnection: boolean;
  jitProvisioningEnabled: boolean;
}

export const OrganizationUpdatesSection = ({
  connection,
  defaultConnectionName,
  isDefaultConnection,
}: {
  connection: TaggedConnection;
  defaultConnectionName: string | undefined;
  isDefaultConnection: boolean;
}) => {
  const { data: canSetDefaultConnection } = useRbac('stytch.organization', 'update.settings.default-sso-connection');
  const { data: canSetSsoJitProvisioning } = useRbac('stytch.organization', 'update.settings.sso-jit-provisioning');

  const { data: organization } = useOrgInfo();

  const orgJitProvisioningPolicy = organization?.sso_jit_provisioning;

  const remoteState = useMemo(
    () => ({
      isDefaultConnection,
      jitProvisioningEnabled: !!(
        orgJitProvisioningPolicy === 'ALL_ALLOWED' ||
        (orgJitProvisioningPolicy === 'RESTRICTED' &&
          organization?.sso_jit_provisioning_allowed_connections.includes(connection.connection_id))
      ),
    }),
    [
      connection.connection_id,
      isDefaultConnection,
      orgJitProvisioningPolicy,
      organization?.sso_jit_provisioning_allowed_connections,
    ],
  );

  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });

  const { setDefault } = useMutateDefaultConnection();
  const { mutate } = useMutateOrganization();

  const handleSave = useCallback(async () => {
    if (!organization) {
      return Promise.reject(new Error('Failed to save changes.'));
    }

    const promises: Promise<unknown>[] = [];

    if (!remoteState.isDefaultConnection && localState.isDefaultConnection) {
      promises.push(
        setDefault({
          connectionId: connection.connection_id,
          connectionName: connection.display_name,
        }),
      );
    }

    if (localState.jitProvisioningEnabled && !remoteState.jitProvisioningEnabled) {
      if (orgJitProvisioningPolicy === 'NOT_ALLOWED' || orgJitProvisioningPolicy === 'RESTRICTED') {
        const allowedConnections = new Set(organization.sso_jit_provisioning_allowed_connections ?? []);
        allowedConnections.add(connection.connection_id);
        promises.push(
          mutate(
            {
              sso_jit_provisioning: 'RESTRICTED',
              sso_jit_provisioning_allowed_connections: Array.from(allowedConnections),
            },
            { errorMessage: 'Failed to enable JIT provisioning.' },
          ),
        );
      }
    }

    if (!localState.jitProvisioningEnabled && remoteState.jitProvisioningEnabled) {
      if (orgJitProvisioningPolicy === 'RESTRICTED') {
        const allowedConnections = new Set(organization.sso_jit_provisioning_allowed_connections ?? []);
        allowedConnections.delete(connection.connection_id);
        promises.push(
          mutate(
            {
              sso_jit_provisioning: allowedConnections.size === 0 ? 'NOT_ALLOWED' : 'RESTRICTED',
              sso_jit_provisioning_allowed_connections: Array.from(allowedConnections),
            },
            { errorMessage: 'Failed to disable JIT provisioning.' },
          ),
        );
      }
    }

    return Promise.all(promises).then(() => {
      // no-op to return void
    });
  }, [
    connection.connection_id,
    connection.display_name,
    localState.isDefaultConnection,
    localState.jitProvisioningEnabled,
    mutate,
    orgJitProvisioningPolicy,
    organization,
    remoteState.isDefaultConnection,
    remoteState.jitProvisioningEnabled,
    setDefault,
  ]);

  const { useBlockNavigation } = useSsoRouterController();

  const disableSave = orgJitProvisioningPolicy !== 'RESTRICTED' && isDefaultConnection;

  return (
    <SettingsContainer
      title="Authentication settings"
      hasCTA={(canSetDefaultConnection || canSetSsoJitProvisioning) && !disableSave}
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      setEditing={handleSetEditing}
    >
      <OrganizationUpdatesSectionBody
        connection={connection}
        defaultConnectionName={defaultConnectionName}
        orgJitProvisioningPolicy={orgJitProvisioningPolicy}
        remoteState={remoteState}
        localState={localState}
        setLocalState={setLocalState}
      />
    </SettingsContainer>
  );
};
