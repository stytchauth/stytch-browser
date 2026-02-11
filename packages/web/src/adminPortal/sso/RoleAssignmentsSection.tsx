import { Add } from '@mui/icons-material';
import { B2BSSOSAMLUpdateConnectionOptions, B2BSSOUpdateExternalConnectionOptions } from '@stytch/core/public';
import React, { SetStateAction, useCallback, useMemo } from 'react';

import { deepEqual } from '../../utils/deepEqual';
import { Autocomplete } from '../components/Autocomplete';
import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { Input } from '../components/Input';
import { RolesList } from '../components/RolesList';
import { SettingsContainer, useSettingsContainer } from '../components/SettingsContainer';
import { SettingsSection } from '../components/SettingsSection';
import { Table } from '../components/Table';
import { Typography } from '../components/Typography';
import { TableItemRenderer } from '../shared/components/types';
import { getSsoConnectionRoleAssignments, getSsoGroupRoleAssignments } from '../utils/getSsoRoleAssignments';
import { useFormState } from '../utils/useFormState';
import { useMutateSsoConnection } from '../utils/useMutateSsoConnection';
import { useRbac } from '../utils/useRbac';
import { useRoleAutocomplete } from '../utils/useRoleAutocomplete';
import { getIdpInfo } from './IdpInfo';
import { useSsoRouterController } from './SSORouter';
import { ExternalTaggedConnection, SAMLTaggedConnection } from './TaggedConnection';

type ImplicitRoleAssignment = {
  group: string;
  roleIds: string[];
};

interface RoleAssignmentsFormState {
  connectionRoleIds: string[];
  groupedRoles: ImplicitRoleAssignment[];
}

const RoleAssignmentsSectionBody = ({
  connection,
  localState,
  setLocalState,
  remoteState,
}: {
  connection: SAMLTaggedConnection | ExternalTaggedConnection;
  localState: RoleAssignmentsFormState;
  setLocalState: (state: SetStateAction<RoleAssignmentsFormState>) => void;
  remoteState: RoleAssignmentsFormState;
}) => {
  const { editing } = useSettingsContainer();

  const { data: canGetOrgCustomRoles } = useRbac('stytch.custom-org-roles', 'get');

  const { connectionRoleIds, groupedRoles } = editing ? localState : remoteState;

  const connectionNeedsGroupAttributeMapping =
    connection.connectionType === 'saml' && !connection.attribute_mapping.groups;

  const roleAutocompleteProps = useRoleAutocomplete({ includeOrgRoles: canGetOrgCustomRoles ?? false });

  const handleAddGroupRole = useCallback(() => {
    setLocalState((state) => ({
      ...state,
      groupedRoles: [...state.groupedRoles, { group: '', roleIds: [] }],
    }));
  }, [setLocalState]);

  const handleConnectionRolesChange = useCallback(
    (value: string[]): void => {
      return setLocalState((state) => ({ ...state, connectionRoleIds: value }));
    },
    [setLocalState],
  );

  const idpInfo = connection.connectionType === 'saml' ? getIdpInfo(connection.identity_provider, 'saml') : undefined;

  const implicitRoleAssignments =
    connection.connectionType === 'saml'
      ? connection.saml_connection_implicit_role_assignments
      : connection.external_connection_implicit_role_assignments;

  return (
    <FlexBox flexDirection="column" gap={2}>
      <SettingsSection
        title="Connection Roles"
        tooltipText="Connection Roles are automatically assigned to all Members who authenticate via this SSO connection."
      >
        {editing ? (
          <Autocomplete {...roleAutocompleteProps} value={connectionRoleIds} onChange={handleConnectionRolesChange} />
        ) : implicitRoleAssignments.length > 0 ? (
          <RolesList roles={implicitRoleAssignments} />
        ) : (
          <Typography variant="body2">No roles assigned.</Typography>
        )}
      </SettingsSection>
      <SettingsSection
        title="Group Roles"
        tooltipText="If a Member is part of a group, they will be assigned both the Connection Role and their Group Role."
      >
        {connection.connectionType === 'external' && (
          <Typography variant="body2">
            Ensure a &quot;groups&quot; key exists in the external connection Attribute Mapping first to assign group
            roles.
          </Typography>
        )}
        {!connectionNeedsGroupAttributeMapping ? (
          editing ? (
            <>
              {groupedRoles.map(({ group, roleIds }, i) => (
                <FlexBox key={i} alignItems="stretch" justifyContent="space-between">
                  <Input
                    label="Group name"
                    fullWidth
                    value={group}
                    onChange={(value) => {
                      setLocalState((state) => ({
                        ...state,
                        groupedRoles: state.groupedRoles.map((item, index) =>
                          index === i ? { ...item, group: value } : item,
                        ),
                      }));
                    }}
                  />
                  <Autocomplete
                    {...roleAutocompleteProps}
                    label="Group Role"
                    value={roleIds}
                    fullWidth
                    onChange={(values) => {
                      setLocalState((state) => ({
                        ...state,
                        groupedRoles: state.groupedRoles.map((item, index) =>
                          index === i ? { ...item, roleIds: values } : item,
                        ),
                      }));
                    }}
                  />
                </FlexBox>
              ))}
              <Button variant="text" startIcon={<Add />} onClick={handleAddGroupRole}>
                Add group roles
              </Button>
            </>
          ) : groupedRoles.length > 0 ? (
            <Table
              items={groupedRoles}
              rowKeyExtractor={roleAssignmentKeyExtractor}
              itemRenderer={roleAssignmentItemRenderer}
            ></Table>
          ) : (
            <Typography variant="body2">No roles assigned.</Typography>
          )
        ) : (
          idpInfo && (
            <Typography variant="body2">
              Add a &quot;groups&quot; key in the {idpInfo.idp.attributeMappingLabel} first to assign group roles.
            </Typography>
          )
        )}
      </SettingsSection>
    </FlexBox>
  );
};

const roleAssignmentKeyExtractor = ({ group }: ImplicitRoleAssignment) => group;

const roleAssignmentItemRenderer: TableItemRenderer<ImplicitRoleAssignment>[] = [
  {
    title: 'Group',
    getValue: ({ group }) => (
      <Typography variant="body2" color="secondary">
        {group}
      </Typography>
    ),
  },
  { title: 'Role', getValue: ({ roleIds }) => <RolesList roles={roleIds} /> },
];

export const RoleAssignmentsSection = ({
  canUpdateConnection,
  connection,
}: {
  canUpdateConnection: boolean;
  connection: SAMLTaggedConnection | ExternalTaggedConnection;
}) => {
  const implicitRoleAssignments = getSsoConnectionRoleAssignments(connection);
  const implicitGroupAssignments = getSsoGroupRoleAssignments(connection);

  const connectionRoleIds = useMemo(
    () => implicitRoleAssignments.map(({ role_id }) => role_id),
    [implicitRoleAssignments],
  );

  const groupedRoles = useMemo(() => {
    return Object.values(
      implicitGroupAssignments.reduce<Record<string, ImplicitRoleAssignment>>((acc, { group, role_id }) => {
        if (!acc[group]) {
          acc[group] = { group, roleIds: [] };
        }

        acc[group].roleIds.push(role_id);

        return acc;
      }, {}),
    );
  }, [implicitGroupAssignments]);

  const remoteState = useMemo<RoleAssignmentsFormState>(
    () => ({
      connectionRoleIds,
      groupedRoles,
    }),
    [connectionRoleIds, groupedRoles],
  );

  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });

  const { mutate } = useMutateSsoConnection(connection.connectionType);

  const handleSave = useCallback(async () => {
    const baseOptions = {
      connection_id: connection.connection_id,
    };

    const implicitRoleAssignments = !deepEqual(remoteState.connectionRoleIds, localState.connectionRoleIds)
      ? localState.connectionRoleIds.map((role_id) => ({
          role_id,
        }))
      : undefined;

    const filteredGroupRoles = localState.groupedRoles.filter(({ group, roleIds }) => group && roleIds.length > 0);
    const implicitGroupAssignments = !deepEqual(remoteState.groupedRoles, filteredGroupRoles)
      ? filteredGroupRoles.flatMap(({ group, roleIds }) => roleIds.map((role_id) => ({ group, role_id })))
      : undefined;

    if (connection.connectionType === 'saml') {
      const mutatedProperties: Partial<B2BSSOSAMLUpdateConnectionOptions> = {
        ...(implicitRoleAssignments && { saml_connection_implicit_role_assignments: implicitRoleAssignments }),
        ...(implicitGroupAssignments && { saml_group_implicit_role_assignments: implicitGroupAssignments }),
      };

      if (Object.keys(mutatedProperties).length > 0) {
        return mutate({ ...baseOptions, ...mutatedProperties }, { errorMessage: 'Failed to update role assignments.' });
      }
    } else {
      const mutatedProperties: Partial<B2BSSOUpdateExternalConnectionOptions> = {
        ...(implicitRoleAssignments && { external_connection_implicit_role_assignments: implicitRoleAssignments }),
        ...(implicitGroupAssignments && { external_group_implicit_role_assignments: implicitGroupAssignments }),
      };

      if (Object.keys(mutatedProperties).length > 0) {
        return mutate({ ...baseOptions, ...mutatedProperties }, { errorMessage: 'Failed to update role assignments.' });
      }
    }

    return Promise.resolve();
  }, [
    connection.connectionType,
    connection.connection_id,
    localState.connectionRoleIds,
    localState.groupedRoles,
    mutate,
    remoteState.connectionRoleIds,
    remoteState.groupedRoles,
  ]);

  const { useBlockNavigation } = useSsoRouterController();

  return (
    <SettingsContainer
      title="Role assignments"
      hasCTA={canUpdateConnection}
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      setEditing={handleSetEditing}
    >
      <RoleAssignmentsSectionBody
        connection={connection}
        localState={localState}
        remoteState={remoteState}
        setLocalState={setLocalState}
      />
    </SettingsContainer>
  );
};
