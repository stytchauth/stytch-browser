import AddIcon from '@mui/icons-material/AddRounded';
import { Paper, TableContainer } from '@mui/material';
import { RBACPolicyRole } from '@stytch/core';
import { Organization, SCIMConnection } from '@stytch/core/public';
import React, { useMemo, useState } from 'react';

import { uniqueValuesSplitOnSpaces } from '../../utils/uniqueValuesSplitOnSpaces';
import { Autocomplete } from '../components/Autocomplete';
import { Button } from '../components/Button';
import { Divider } from '../components/Divider';
import { FlexBox } from '../components/FlexBox';
import { Input } from '../components/Input';
import { Modal, useModalState } from '../components/Modal';
import { PageLoadingIndicator } from '../components/PageLoadingIndicator';
import { Select } from '../components/Select';
import { SettingsContainer } from '../components/SettingsContainer';
import { SettingsSection } from '../components/SettingsSection';
import { Table } from '../components/Table';
import { Tag } from '../components/Tag';
import { Typography } from '../components/Typography';
import { TableItemRenderer } from '../shared/components/types';
import { ExternalTaggedConnection, SAMLTaggedConnection } from '../sso/TaggedConnection';
import { arraysHaveSameContents } from '../utils/arraysHaveSameContents';
import { FormSectionBody } from '../utils/FormSectionBody';
import { getSsoConnectionRoleAssignments, getSsoGroupRoleAssignments } from '../utils/getSsoRoleAssignments';
import { useAdminPortalConfig } from '../utils/useAdminPortalConfig';
import { useFormState } from '../utils/useFormState';
import { useMutateOrganization } from '../utils/useMutateOrganization';
import { useMutateScimConnectionRoleAssignments } from '../utils/useMutateScimConnection';
import { useMutateSsoConnection } from '../utils/useMutateSsoConnection';
import { useRbac } from '../utils/useRbac';
import { useRoleAutocomplete } from '../utils/useRoleAutocomplete';
import { useRoles } from '../utils/useRoles';
import { useRolesById, useRoleSortFn } from '../utils/useRoleSortFn';
import { useScimConnection } from '../utils/useScimConnection';
import { useScimConnectionGroups } from '../utils/useScimConnectionGroups';
import { useSsoConnections } from '../utils/useSsoConnections';
import { useOrgSettingsRouterController } from './AdminPortalOrgRouter';

type SCIMGroupRoleAssignments = SCIMConnection['scim_group_implicit_role_assignments'];

interface RoleAssignmentsFormState {
  idMap: IdToRoleAssignments;
}

interface OrgSettingsRoleAssignmentsBodyProps extends FormSectionBody<RoleAssignmentsFormState> {
  editing: boolean;
  ssoConnections: (SAMLTaggedConnection | ExternalTaggedConnection)[];
  roles: RBACPolicyRole[];
  isSsoEnabled: boolean;
  isScimEnabled: boolean;
  canViewCustomOrgRoles: boolean;
  allScimGroupIdToGroupName: Record<string, string>;
  scimConnection?: SCIMConnection;
}

interface RoleTableProps
  extends Omit<
    OrgSettingsRoleAssignmentsBodyProps,
    | 'ssoConnections'
    | 'roles'
    | 'scimGroupAssignments'
    | 'allScimGroupIdToGroupName'
    | 'scimConnection'
    | 'canViewCustomOrgRoles'
  > {
  role: RBACPolicyRole;
}

const roleAssignmentsItemRenderers = (
  idMap: IdToRoleAssignments,
  rolesById: Record<string, { displayName: string }> | undefined,
) => [
  {
    title: 'Role',
    getValue: (role: RBACPolicyRole) => {
      return (
        <FlexBox flexDirection="row" alignItems="center">
          <Tag>{rolesById?.[role.role_id]?.displayName ?? role.role_id}</Tag>
          <Typography variant="body2">{`(${String(idMap[role.role_id]?.length ?? 0)})`}</Typography>
        </FlexBox>
      );
    },
  },
];
const roleAssigmnentsKeyExtractor = (role: RBACPolicyRole): string => role.role_id;

type IdToRoleAssignments = Record<string, RoleAssignment[]>;
type Source = 'SSO' | 'Email' | 'SCIM';

type SSORoleAssignment = {
  source: 'SSO';
  id: string;
  displayName: string;
  group: string;
};
type EmailRoleAssignment = {
  source: 'Email';
  displayName: string;
};
type SCIMRoleAssignment = {
  source: 'SCIM';
  displayName: string;
  groupId: string;
  groupName: string;
};
type RoleAssignment = SSORoleAssignment | EmailRoleAssignment | SCIMRoleAssignment;

const roleItemRendererer: TableItemRenderer<RoleAssignment>[] = [
  {
    title: 'Source',
    getValue: (value) => {
      return <Typography variant="body2">{value.source}</Typography>;
    },
  },
  {
    title: 'Source Name',
    getValue: (value) => {
      return <Typography variant="body2">{value.displayName}</Typography>;
    },
  },
  {
    title: 'Group',
    getValue: (value) => {
      return (
        <Typography variant="body2">
          {value.source === 'SSO' ? value.group : value.source === 'SCIM' ? value.groupName : ''}
        </Typography>
      );
    },
  },
];
const roleKeyExtractor = (role: RoleAssignment): string => role.displayName;

const useMutateRoleAssignments = () => {
  const { mutate } = useMutateOrganization();

  const setOrgEmailAssignments = (emails: Organization['rbac_email_implicit_role_assignments']) => {
    return mutate(
      {
        rbac_email_implicit_role_assignments: emails,
      },
      {
        errorMessage: 'Failed to update email role assignments.',
      },
    );
  };

  return { setOrgEmailAssignments };
};
const RoleTable = ({
  localState,
  remoteState,
  editing,
  setLocalState,
  role,
  isSsoEnabled,
  isScimEnabled,
}: RoleTableProps) => {
  const roleId = role.role_id;
  const items = (editing ? localState : remoteState).idMap[roleId] ?? [];

  return (
    <TableContainer component={Paper} variant={'outlined'}>
      <Table
        itemRenderer={roleItemRendererer}
        items={items}
        rowKeyExtractor={roleKeyExtractor}
        disableBottomBorder={true}
        titleVariant="caption"
        getItemActionProps={
          editing
            ? (roleAssignment) => ({
                warningAction:
                  roleAssignment.source === 'Email' ||
                  (roleAssignment.source === 'SSO' && isSsoEnabled) ||
                  (roleAssignment.source === 'SCIM' && isScimEnabled)
                    ? {
                        text: 'Delete',
                        onClick: () => {
                          setLocalState((state) => {
                            const assignments = state.idMap[roleId].filter((item) => item !== roleAssignment);
                            return {
                              ...state,
                              idMap: {
                                ...state.idMap,
                                [roleId]: assignments,
                              },
                            };
                          });
                        },
                      }
                    : undefined,
              })
            : undefined
        }
      />
    </TableContainer>
  );
};

type NewSSOConnection = {
  id: string;
  group: string;
};
const filterRoleAssignmentsBy = (arr: RoleAssignment[], { source }: { source: Source }) => {
  return arr.slice().filter((val) => val.source === source);
};

interface SSORoleAssignmentInfo {
  connectionRoleAssignments: {
    role_id: string;
  }[];
  groupRoleAssignments: {
    role_id: string;
    group: string;
  }[];
}

const OrgSettingsRoleAssignmentsBody = ({
  editing,
  ssoConnections,
  roles,
  localState,
  remoteState,
  setLocalState,
  isSsoEnabled,
  isScimEnabled,
  canViewCustomOrgRoles,
  allScimGroupIdToGroupName,
  scimConnection,
}: OrgSettingsRoleAssignmentsBodyProps) => {
  const idMap = (editing ? localState : remoteState).idMap;
  const rolesWithAssignments = roles.filter((role) => idMap[role.role_id].length > 0);
  const rolesById = useRolesById();
  const itemRenderers = roleAssignmentsItemRenderers(idMap, rolesById);

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  const [emailDomain, setEmailDomain] = useState('');
  const [ssoRoleAssignments, setSsoRoleAssignments] = useState<NewSSOConnection[]>([
    {
      id: '',
      group: '',
    },
  ]);
  const [scimGroupIds, setScimGroupIds] = useState<string[]>([]);

  const [roleOpenIds, setRoleOpenIds] = useState<Set<string>>(new Set());

  const idToHasGroupAttributeMapping = ssoConnections.reduce<Record<string, boolean>>((acc, connection) => {
    acc[connection.connection_id] = connection.connectionType !== 'saml' || !!connection.attribute_mapping.groups;
    return acc;
  }, {});

  const sourceItems = new Set<Source>(['Email']);
  if (isSsoEnabled && ssoConnections.length > 0) {
    sourceItems.add('SSO');
  }
  if (isScimEnabled && scimConnection && Object.keys(allScimGroupIdToGroupName).length > 0) {
    sourceItems.add('SCIM');
  }

  const sourceSelectItems = Array.from(sourceItems).map((source) => ({
    label: source,
    value: source,
  }));

  const addRoleAssignmentModalProps = useModalState(() => {
    if (!selectedSource) return;

    const roleId = selectedRole!;
    setRoleOpenIds((prev) => new Set([...prev].concat(roleId)));
    setLocalState((state) => {
      const remoteRoleAssignments = [...state.idMap[roleId]];
      const mergedRoleAssignments: RoleAssignment[] = [...remoteRoleAssignments];

      const filteredRoleAssignments = filterRoleAssignmentsBy(remoteRoleAssignments, { source: selectedSource });
      if (selectedSource === 'Email') {
        const domains = new Set<string>();

        (filteredRoleAssignments as EmailRoleAssignment[]).forEach((roleAssignment) => {
          domains.add(roleAssignment.displayName);
        });
        uniqueValuesSplitOnSpaces({ input: emailDomain }).forEach((domain) => {
          if (!domains.has(domain)) {
            domains.add(domain);
            mergedRoleAssignments.push({
              source: selectedSource,
              displayName: domain,
            });
          }
        });
      } else if (selectedSource === 'SSO') {
        ssoRoleAssignments.forEach((ssoConnection) => {
          const connectionId = ssoConnection.id;
          if (connectionId.length !== 0) {
            const group = ssoConnection.group.trim();

            if (
              !mergedRoleAssignments.some(
                (roleAssignment) =>
                  roleAssignment.source === 'SSO' &&
                  roleAssignment.id === connectionId &&
                  roleAssignment.group === group,
              )
            ) {
              mergedRoleAssignments.push({
                source: selectedSource,
                displayName: ssoConnections.find((val) => val.connection_id === connectionId)?.display_name ?? '',
                id: ssoConnection.id,
                group,
              });
            }
          }
        });
      } else if (selectedSource === 'SCIM') {
        const currentGroupIds: Set<string> = new Set<string>();

        (filteredRoleAssignments as SCIMRoleAssignment[]).forEach((roleAssignment) => {
          currentGroupIds.add(roleAssignment.groupId);
        });

        scimGroupIds.forEach((id) => {
          if (!currentGroupIds.has(id)) {
            mergedRoleAssignments.push({
              source: selectedSource,
              displayName: scimConnection?.display_name ?? '',
              groupId: id,
              groupName: allScimGroupIdToGroupName[id],
            });
          }
        });
      }
      if (mergedRoleAssignments.length !== remoteRoleAssignments.length) {
        return {
          ...state,
          idMap: {
            ...state.idMap,
            [roleId]: mergedRoleAssignments,
          },
        };
      }
      return state;
    });
  });

  const showInputContent = !!selectedRole && !!selectedSource;
  const disableConfirm =
    !showInputContent ||
    (selectedSource === 'Email' && emailDomain.length === 0) ||
    (selectedSource === 'SSO' && ssoRoleAssignments.every((connection) => !connection.id));

  const roleAutocompleteProps = useRoleAutocomplete({ includeOrgRoles: canViewCustomOrgRoles });
  const roleSelectItems = roleAutocompleteProps.selectItems.map((roleId) => ({
    label: roleAutocompleteProps.getOptionLabel(roleId),
    value: roleId,
    subtext: roleAutocompleteProps.getOptionDescription(roleId),
  }));

  const ssoGroupSelectItems = useMemo(
    () =>
      ssoConnections.map(({ connection_id: id, display_name: displayName }) => ({
        label: displayName,
        value: id,
      })),
    [ssoConnections],
  );

  const scimGroupSelectItems = useMemo(() => Object.keys(allScimGroupIdToGroupName), [allScimGroupIdToGroupName]);

  const sourceToInputContentMap: Record<Source, JSX.Element> = {
    Email: (
      <>
        <SettingsSection title="Email Domain">
          <Typography variant="body2">
            Separate domains by a single space to assign to multiple email domains.
          </Typography>
          <Input label="Domain" fullWidth value={emailDomain} onChange={setEmailDomain} />
        </SettingsSection>
      </>
    ),
    SSO: (
      <>
        <SettingsSection title="SSO">
          <Typography variant="body2">
            Enter a Group name to assign a Role at the Group level, or leave blank to assign at the SSO connection
            level. If assigning group Roles to an external connection, ensure a &quot;groups&quot; key exists in the
            external connection Attribute Mapping.
          </Typography>

          {ssoRoleAssignments.map(({ id, group }, index) => {
            const isValidConnection = !!id;
            const connectionHasGroupMapping = !!idToHasGroupAttributeMapping[id];
            const isValidConnectionWithGroupMapping = isValidConnection && connectionHasGroupMapping;

            const disableGroupInput = !isValidConnectionWithGroupMapping;
            const groupInputPlaceholder =
              isValidConnection && !connectionHasGroupMapping ? 'Add a "groups" key first' : 'Enter or leave blank';
            const groupInputCaption =
              isValidConnection && !connectionHasGroupMapping
                ? 'Add a "groups" key in the SSO Attribute Mapping first to assign group roles.'
                : undefined;
            return (
              <FlexBox key={index} flexDirection="row" gap={2}>
                <Select
                  label="Connection Display Name"
                  width={250}
                  placeholder="Select"
                  selectItems={selectedRole ? ssoGroupSelectItems : []}
                  value={id}
                  onChange={(val) => {
                    setSsoRoleAssignments((connections) => {
                      return connections.map((connection, currentIndex) => {
                        if (currentIndex === index) {
                          return {
                            ...connection,
                            id: val,
                          };
                        }
                        return connection;
                      });
                    });
                  }}
                />
                <Input
                  label="Group name"
                  value={group}
                  disabled={disableGroupInput}
                  placeholder={groupInputPlaceholder}
                  caption={groupInputCaption}
                  onChange={(val) => {
                    setSsoRoleAssignments((connections) => {
                      return connections.map((connection, currentIndex) => {
                        if (currentIndex === index) {
                          return {
                            ...connection,
                            group: val,
                            id: id,
                            hasGroupAttributeMapping: idToHasGroupAttributeMapping[id],
                          };
                        }
                        return connection;
                      });
                    });
                  }}
                />
              </FlexBox>
            );
          })}
          <Button
            variant="text"
            startIcon={<AddIcon />}
            compact
            onClick={() => {
              setSsoRoleAssignments((connections) => {
                return [
                  ...connections,
                  {
                    id: '',
                    group: '',
                  },
                ];
              });
            }}
          >
            Add SSO Role assignment
          </Button>
        </SettingsSection>
      </>
    ),
    SCIM: (
      <SettingsSection title="SCIM Groups">
        <Autocomplete
          label="Group name"
          selectItems={scimGroupSelectItems}
          value={scimGroupIds}
          getOptionLabel={(value) => allScimGroupIdToGroupName[value]}
          onChange={(value) => {
            setScimGroupIds(() => value);
          }}
        />
      </SettingsSection>
    ),
  };
  return (
    <FlexBox flexDirection="column" gap={1}>
      <Modal
        {...addRoleAssignmentModalProps}
        title="Add Role assignment"
        confirmButtonText="Save"
        disableConfirm={disableConfirm}
        close={() => {
          addRoleAssignmentModalProps.close();
          setSelectedRole(null);
          setSelectedSource(null);
          setEmailDomain('');
          setSsoRoleAssignments([
            {
              id: '',
              group: '',
            },
          ]);
        }}
      >
        <FlexBox flexDirection="column" gap={2}>
          <Select
            label="Select Role"
            selectItems={roleSelectItems}
            value={selectedRole}
            onChange={(val) => {
              setSelectedRole(val);
            }}
            placeholder="Select Role"
          />
          <Select
            label="Select Source"
            selectItems={sourceSelectItems}
            value={selectedSource}
            placeholder="Select Source"
            onChange={(val) => {
              setSelectedSource(val);
            }}
          />
          {showInputContent && (
            <>
              <Divider />
              {sourceToInputContentMap[selectedSource!]}
            </>
          )}
        </FlexBox>
      </Modal>
      <Typography variant="body2" color="secondary">
        {
          "Configure automatic granting and revoking of roles based on the member's email domain, SCIM Group membership, or SSO Connection."
        }
      </Typography>
      {editing && (
        <FlexBox justifyContent="flex-start">
          <Button variant="text" startIcon={<AddIcon />} compact={true} onClick={addRoleAssignmentModalProps.open}>
            Add Role assignment
          </Button>
        </FlexBox>
      )}
      {rolesWithAssignments.length > 0 ? (
        <Table
          titleVariant="caption"
          itemRenderer={itemRenderers}
          items={rolesWithAssignments}
          rowKeyExtractor={roleAssigmnentsKeyExtractor}
          openIds={roleOpenIds}
          onOpenChange={({ id, open }) => {
            setRoleOpenIds((prev) => {
              const newRoleOpenIds = new Set(prev);
              if (open) {
                newRoleOpenIds.add(id);
              } else {
                newRoleOpenIds.delete(id);
              }
              return newRoleOpenIds;
            });
          }}
          ExpandedContent={({ data: role }) => {
            return (
              <RoleTable
                role={role}
                editing={editing}
                setLocalState={setLocalState}
                localState={localState}
                remoteState={remoteState}
                isSsoEnabled={isSsoEnabled}
                isScimEnabled={isScimEnabled}
              />
            );
          }}
        />
      ) : (
        <Typography variant="body2">No role assignments.</Typography>
      )}
    </FlexBox>
  );
};
const sortByKeyAndValue = <T extends Record<string, string>>(array: T[], sortKey: string) => {
  const sortedByKeys = [...array].sort((a, b) => a[sortKey].localeCompare(b[sortKey]));

  // Then, sort the keys and values within each object
  return sortedByKeys.map((obj) => {
    return Object.fromEntries(
      Object.entries(obj).sort(([keyA, valA], [keyB, valB]) => {
        return keyA.localeCompare(keyB) || valA.localeCompare(valB);
      }),
    );
  });
};
type RbacEmailRoleAssignment = { role_id: string; domain: string };

export const OrgSettingsRoleAssignmentsSection = ({ orgInfo }: { orgInfo: Organization }) => {
  const { data: adminPortalConfig } = useAdminPortalConfig({ shouldFetch: true });
  const { data: canSetRoles } = useRbac('stytch.organization', 'update.settings.implicit-roles');
  const { data: canGetSsoPerm } = useRbac('stytch.sso', 'get');
  const { data: canGetScimPerm } = useRbac('stytch.scim', 'get');
  const { data: canGetOrgCustomRoles } = useRbac('stytch.custom-org-roles', 'get');
  const isSsoEnabled = adminPortalConfig?.sso_config.sso_enabled ?? false;
  const isScimEnabled = adminPortalConfig?.scim_config.scim_enabled ?? false;

  const canGetSso = (isSsoEnabled && canGetSsoPerm) ?? false;
  const canGetScim = (isScimEnabled && canGetScimPerm) ?? false;

  const { data: ssoConnections, isLoading: isLoadingSso } = useSsoConnections({
    shouldFetch: canGetSso && !!canSetRoles,
  });
  const { data: scimConnection, isLoading: isLoadingScim } = useScimConnection({
    shouldFetch: canGetScim && !!canSetRoles,
  });
  const { data: scimConnectionGroups, isLoading: isLoadingScimGroups } = useScimConnectionGroups({
    shouldFetch: canGetScim && !!canSetRoles,
  });

  const roles = useRoles(canGetOrgCustomRoles);
  const sortRoles = useRoleSortFn();
  const sortedRoles = useMemo(() => sortRoles(roles ?? []), [roles, sortRoles]);

  const rbacEmails = orgInfo.rbac_email_implicit_role_assignments;
  const taggedConnections: (SAMLTaggedConnection | ExternalTaggedConnection)[] = useMemo(
    () => [
      ...(ssoConnections?.saml_connections.map((c) => ({ ...c, connectionType: 'saml' as const })) ?? []),
      ...(ssoConnections?.external_connections.map((c) => ({ ...c, connectionType: 'external' as const })) ?? []),
    ],
    [ssoConnections?.external_connections, ssoConnections?.saml_connections],
  );
  const taggedConnectionsById = useMemo(
    () =>
      taggedConnections.reduce<Record<string, SAMLTaggedConnection | ExternalTaggedConnection>>((acc, val) => {
        acc[val.connection_id] = val;
        return acc;
      }, {}),
    [taggedConnections],
  );
  const allScimGroups = scimConnectionGroups?.scim_groups ?? [];
  const allScimGroupIdToGroupName = allScimGroups.reduce(
    (acc, val) => {
      acc[val.group_id] = val.group_name;
      return acc;
    },
    {} as Record<string, string>,
  );
  const { setOrgEmailAssignments } = useMutateRoleAssignments();
  const { mutate: mutateSamlConnection } = useMutateSsoConnection('saml');
  const { mutate: mutateExternalConnection } = useMutateSsoConnection('external');
  const { mutate: mutateScimConnection } = useMutateScimConnectionRoleAssignments();
  const idMap = useMemo(() => {
    const idToRoleAssignments: IdToRoleAssignments = {};
    sortedRoles.forEach((role) => {
      idToRoleAssignments[role.role_id] = [];
    });

    taggedConnections.forEach((connection) => {
      const connectionRoleAssignments = getSsoConnectionRoleAssignments(connection);
      const groupRoleAssignments = getSsoGroupRoleAssignments(connection);

      connectionRoleAssignments.forEach((implicitRole) => {
        const role = implicitRole.role_id;
        if (!idToRoleAssignments[role]) {
          idToRoleAssignments[role] = [];
        }
        idToRoleAssignments[role].push({
          source: 'SSO',
          displayName: connection.display_name,
          id: connection.connection_id,
          group: '',
        });
      });

      groupRoleAssignments.forEach((implicitRole) => {
        const role = implicitRole.role_id;
        if (!idToRoleAssignments[role]) {
          idToRoleAssignments[role] = [];
        }

        idToRoleAssignments[role].push({
          source: 'SSO',
          displayName: connection.display_name,
          id: connection.connection_id,
          group: implicitRole.group,
        });
      });
    });

    rbacEmails?.forEach((rbacEmail) => {
      const role = rbacEmail.role_id;
      if (!idToRoleAssignments[role]) {
        idToRoleAssignments[role] = [];
      }
      idToRoleAssignments[role].push({
        source: 'Email',
        displayName: rbacEmail.domain,
      });
    });

    scimConnection?.scim_group_implicit_role_assignments.forEach((implicitRole) => {
      const role = implicitRole.role_id;
      if (!idToRoleAssignments[role]) {
        idToRoleAssignments[role] = [];
      }
      idToRoleAssignments[role].push({
        source: 'SCIM',
        displayName: scimConnection.display_name,
        groupId: implicitRole.group_id,
        groupName: allScimGroupIdToGroupName[implicitRole.group_id],
      });
    });

    return idToRoleAssignments;
  }, [
    allScimGroupIdToGroupName,
    taggedConnections,
    rbacEmails,
    scimConnection?.display_name,
    scimConnection?.scim_group_implicit_role_assignments,
    sortedRoles,
  ]);

  const remoteState: RoleAssignmentsFormState = {
    idMap: idMap,
  };
  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });
  const { useBlockNavigation } = useOrgSettingsRouterController();

  const { hasUpdatedEmails, updatedEmailRoleAssignments } = useMemo(() => {
    const remoteEmails = orgInfo.rbac_email_implicit_role_assignments ?? [];
    const localEmails = Object.entries(localState.idMap).reduce<RbacEmailRoleAssignment[]>(
      (acc, [roleId, roleAssignments]) => {
        roleAssignments.forEach((roleAssignment) => {
          if (roleAssignment.source === 'Email') {
            acc.push({
              role_id: roleId,
              domain: roleAssignment.displayName,
            });
          }
        });
        return acc;
      },
      [],
    );

    const sortedLocalEmails = sortByKeyAndValue(localEmails, 'domain');
    const sortedRemoteEmails = sortByKeyAndValue(remoteEmails ?? [], 'domain');

    const isSame = arraysHaveSameContents(sortedLocalEmails, sortedRemoteEmails);
    const updatedEmailRoleAssignments = isSame ? [] : sortedLocalEmails;

    return {
      hasUpdatedEmails: !isSame,
      updatedEmailRoleAssignments: updatedEmailRoleAssignments as RbacEmailRoleAssignment[],
    };
  }, [localState.idMap, orgInfo.rbac_email_implicit_role_assignments]);

  const { hasUpdatedSso, updatedSsoRoleAssignments } = useMemo(() => {
    const remoteAssignments: Record<string, SSORoleAssignmentInfo> = {};
    const localAssignments: Record<string, SSORoleAssignmentInfo> = {};

    taggedConnections?.forEach((connection) => {
      remoteAssignments[connection.connection_id] = {
        connectionRoleAssignments: getSsoConnectionRoleAssignments(connection),
        groupRoleAssignments: getSsoGroupRoleAssignments(connection),
      };
      localAssignments[connection.connection_id] = { connectionRoleAssignments: [], groupRoleAssignments: [] };
    });

    // Mutate the local SAML connections with role assignments from the local state
    Object.entries(localState.idMap).forEach(([roleId, roleAssignments]) => {
      roleAssignments.forEach((roleAssignment) => {
        if (roleAssignment.source === 'SSO') {
          const connectionId = roleAssignment.id;

          if (roleAssignment.group) {
            localAssignments[connectionId].groupRoleAssignments.push({
              role_id: roleId,
              group: roleAssignment.group,
            });
          } else {
            localAssignments[connectionId].connectionRoleAssignments.push({
              role_id: roleId,
            });
          }
        }
      });
    });

    const updatedSsoRoleAssignments: Record<string, SSORoleAssignmentInfo> = {};

    // Compare the local and remote SSO connections to determine which connections need to be updated
    Object.entries(localAssignments).map(([connectionId, localConnection]) => {
      const remoteConnection = remoteAssignments[connectionId];

      const localImplicitRoleAssignments = localConnection.connectionRoleAssignments.map((val) => val.role_id);
      const remoteImplicitRoleAssignments = remoteConnection.connectionRoleAssignments.map((val) => val.role_id);

      const localGroupImplicitRoleAssignments = sortByKeyAndValue(localConnection.groupRoleAssignments, 'group');
      const remoteGroupImplicitRoleAssignments = sortByKeyAndValue(remoteConnection.groupRoleAssignments, 'group');

      if (
        !arraysHaveSameContents(localImplicitRoleAssignments, remoteImplicitRoleAssignments) ||
        !arraysHaveSameContents(localGroupImplicitRoleAssignments, remoteGroupImplicitRoleAssignments)
      ) {
        updatedSsoRoleAssignments[connectionId] = localConnection;
      }
    });

    return {
      hasUpdatedSso: Object.keys(updatedSsoRoleAssignments).length > 0,
      updatedSsoRoleAssignments: updatedSsoRoleAssignments,
    };
  }, [localState.idMap, taggedConnections]);

  const { hasUpdatedScimGroups, updatedScimRoleAssignments } = useMemo(() => {
    const remoteScimGroups: SCIMGroupRoleAssignments = scimConnection?.scim_group_implicit_role_assignments ?? [];
    const localScimGroups: SCIMGroupRoleAssignments = Object.entries(localState.idMap).reduce(
      (acc, [roleId, roleAssignments]) => {
        roleAssignments.forEach((roleAssignment) => {
          if (roleAssignment.source === 'SCIM') {
            acc.push({
              role_id: roleId,
              group_id: roleAssignment.groupId,
            });
          }
        });
        return acc;
      },
      [] as SCIMGroupRoleAssignments,
    );

    const isSame = arraysHaveSameContents(localScimGroups, remoteScimGroups);
    const updatedScimRoleAssignments = isSame ? [] : localScimGroups;

    return {
      hasUpdatedScimGroups: !isSame,
      updatedScimRoleAssignments: updatedScimRoleAssignments,
    };
  }, [localState.idMap, scimConnection]);

  const handleSave = async () => {
    if (hasUpdatedEmails) {
      await setOrgEmailAssignments(updatedEmailRoleAssignments);
    }

    await Promise.all(
      Object.entries(updatedSsoRoleAssignments).map(async ([connectionId, ssoRoleAssignment]) => {
        const connection = taggedConnectionsById[connectionId];
        if (!connection) {
          return;
        }

        if (connection.connectionType === 'saml') {
          await mutateSamlConnection({
            connection_id: connectionId,
            saml_connection_implicit_role_assignments: ssoRoleAssignment.connectionRoleAssignments,
            saml_group_implicit_role_assignments: ssoRoleAssignment.groupRoleAssignments,
          });
        } else {
          await mutateExternalConnection({
            connection_id: connectionId,
            external_connection_implicit_role_assignments: ssoRoleAssignment.connectionRoleAssignments,
            external_group_implicit_role_assignments: ssoRoleAssignment.groupRoleAssignments,
          });
        }
      }),
    );

    if (scimConnection && hasUpdatedScimGroups) {
      await mutateScimConnection({
        connection_id: scimConnection.connection_id,
        scim_group_implicit_role_assignments: updatedScimRoleAssignments,
      });
    }
  };

  if (isLoadingSso || isLoadingScim || isLoadingScimGroups) {
    return <PageLoadingIndicator />;
  }

  const disableSave = !hasUpdatedEmails && !hasUpdatedSso && !hasUpdatedScimGroups;

  return (
    <SettingsContainer
      title="Automatic Role assignments"
      hasCTA={canSetRoles}
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      setEditing={handleSetEditing}
      disableSave={disableSave}
    >
      <OrgSettingsRoleAssignmentsBody
        editing={editing}
        remoteState={remoteState}
        localState={localState}
        setLocalState={setLocalState}
        ssoConnections={taggedConnections}
        roles={sortedRoles}
        isSsoEnabled={isSsoEnabled}
        isScimEnabled={isScimEnabled}
        canViewCustomOrgRoles={canGetOrgCustomRoles ?? false}
        allScimGroupIdToGroupName={allScimGroupIdToGroupName}
        scimConnection={scimConnection}
      />
    </SettingsContainer>
  );
};
