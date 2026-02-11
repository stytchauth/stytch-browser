import Add from '@mui/icons-material/Add';
import { SCIMConnection } from '@stytch/core/public';
import React, { useMemo } from 'react';

import { isTruthy } from '../../utils/isTruthy';
import { Autocomplete } from '../components/Autocomplete';
import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { PageLoadingIndicator } from '../components/PageLoadingIndicator';
import { Select } from '../components/Select';
import { SettingsContainer } from '../components/SettingsContainer';
import { Table } from '../components/Table';
import { TagList } from '../components/TagList';
import { Typography } from '../components/Typography';
import { UseBlockNavigation } from '../Router';
import { arraysHaveSameContents } from '../utils/arraysHaveSameContents';
import { useFormState } from '../utils/useFormState';
import { useMutateScimConnectionRoleAssignments } from '../utils/useMutateScimConnection';
import { useRbac } from '../utils/useRbac';
import { useRoleAutocomplete } from '../utils/useRoleAutocomplete';
import { useRoleDisplayInfo } from '../utils/useRoleDisplayInfo';
import { useScimConnectionGroups } from '../utils/useScimConnectionGroups';

type ScimGroupRoleAssignment = { groupId: string | undefined; roles: string[] };

export const RoleAssignmentsSection = ({
  connection,
  useBlockNavigation,
}: {
  connection: SCIMConnection;
  useBlockNavigation: UseBlockNavigation;
}) => {
  const { data: scimConnectionGroups, isLoading: isLoadingScimGroups } = useScimConnectionGroups({
    shouldFetch: true,
  });

  const { data: canGetOrgCustomRoles } = useRbac('stytch.custom-org-roles', 'get');

  const { mutate: mutateScimConnection } = useMutateScimConnectionRoleAssignments();
  const { getRoleIdDisplayName } = useRoleDisplayInfo(canGetOrgCustomRoles ?? false);

  const scimGroups = useMemo(() => scimConnectionGroups?.scim_groups ?? [], [scimConnectionGroups]);
  const scimRoleAssignments = connection?.scim_group_implicit_role_assignments;

  const { groupIdToName, filteredGroupIdToRoles } = useMemo(() => {
    const groupIdToNameMap = scimGroups.reduce(
      (acc, val) => {
        acc[val.group_id] = val.group_name;
        return acc;
      },
      {} as Record<string, string>,
    );

    const groupIdToRolesMap = Object.keys(groupIdToNameMap).reduce(
      (acc, groupId) => {
        const scimRoleAssignment = scimRoleAssignments.find((roleAssignment) => roleAssignment.group_id === groupId);
        if (!scimRoleAssignment) return acc;

        if (!acc[groupId]) {
          acc[groupId] = [];
        }
        acc[groupId].push(scimRoleAssignment.role_id);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    return {
      groupIdToName: groupIdToNameMap,
      // Filter out groups with no roles assigned
      filteredGroupIdToRoles: Object.fromEntries(
        Object.entries(groupIdToRolesMap).filter(([, roles]) => roles.length > 0),
      ),
    };
  }, [scimGroups, scimRoleAssignments]);

  const remoteState: { groupRoles: ScimGroupRoleAssignment[] } = useMemo(
    () => ({
      groupRoles: Object.entries(filteredGroupIdToRoles).map(([groupId, roles]) => ({
        groupId,
        roles,
      })),
    }),
    [filteredGroupIdToRoles],
  );
  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });
  const { groupRoles } = editing ? localState : remoteState;

  const itemRenderer = [
    {
      title: 'Group',
      getValue: ({ groupId }: ScimGroupRoleAssignment) => {
        return (
          <Typography variant="body2" color="secondary">
            {groupId ? groupIdToName[groupId] : ''}
          </Typography>
        );
      },
      width: 300,
    },
    {
      title: 'Role',
      getValue: ({ roles }: ScimGroupRoleAssignment) => {
        return <TagList tags={roles.map((role) => getRoleIdDisplayName(role))} />;
      },
    },
  ];

  const roleAutocompleteProps = useRoleAutocomplete({ includeOrgRoles: canGetOrgCustomRoles ?? false });

  const groupIdsWithRoleAssignments = new Set(groupRoles.map(({ groupId }) => groupId));
  const findAvailableGroupIds = (currentId: string | undefined) =>
    Object.keys(groupIdToName).filter((groupId) => !groupIdsWithRoleAssignments.has(groupId) || groupId === currentId);
  // Find the groupIds that do not have any roles assigned to them.
  const availableGroupIds = findAvailableGroupIds(undefined);

  const handleOnChange = ({
    groupId: currentGroupId,
    updatedGroupId,
    updatedRoles,
  }: {
    groupId: string | undefined;
    updatedGroupId: string | undefined;
    updatedRoles: string[] | undefined;
  }) => {
    setLocalState((prevState) => ({
      groupRoles: prevState.groupRoles.map((value) => {
        if (value.groupId !== currentGroupId) {
          return value;
        }
        return {
          groupId: updatedGroupId ?? value.groupId,
          roles: updatedRoles ?? value.roles,
        };
      }),
    }));
  };

  const disableSave = arraysHaveSameContents(localState.groupRoles, remoteState.groupRoles);
  const disableAdd =
    (localState.groupRoles.length > 0
      ? localState.groupRoles[localState.groupRoles.length - 1].groupId === undefined
      : false) || !availableGroupIds.length;

  const handleSave = async () => {
    await mutateScimConnection({
      connection_id: connection.connection_id,
      scim_group_implicit_role_assignments: localState.groupRoles.flatMap(({ groupId, roles }) => {
        return roles
          .map((role) => {
            if (groupId) {
              return {
                group_id: groupId,
                role_id: role,
              };
            }
          })
          .filter(isTruthy);
      }),
    });
  };

  if (isLoadingScimGroups) {
    return <PageLoadingIndicator />;
  }

  return (
    <SettingsContainer
      title="Role Assignments"
      hasCTA={Object.keys(groupIdToName).length > 0}
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      disableSave={disableSave}
      setEditing={handleSetEditing}
    >
      <Typography variant="h4">Group Roles</Typography>
      {editing ? (
        <FlexBox flexDirection="column" gap={2}>
          {localState.groupRoles.length > 0 ? (
            <div>
              {groupRoles.map(({ groupId, roles }, index) => {
                const groupNameSelectItems = findAvailableGroupIds(groupId).map((groupId) => {
                  return {
                    value: groupId,
                    label: groupIdToName[groupId],
                  };
                });
                return (
                  <FlexBox flexDirection="row" gap={2} key={index} alignItems="center">
                    <Select
                      labelColor="secondary"
                      width={300}
                      label="Group name"
                      selectItems={groupNameSelectItems}
                      placeholder="Select Group Name"
                      value={groupId}
                      onChange={(value) => handleOnChange({ groupId, updatedGroupId: value, updatedRoles: undefined })}
                    />
                    <Autocomplete
                      {...roleAutocompleteProps}
                      label="Group Role"
                      fullWidth
                      value={roles}
                      onChange={(value) => handleOnChange({ groupId, updatedGroupId: undefined, updatedRoles: value })}
                    />
                  </FlexBox>
                );
              })}
            </div>
          ) : (
            <Typography variant="body2">No roles assigned.</Typography>
          )}
          <Button
            disabled={disableAdd}
            startIcon={<Add />}
            variant="text"
            onClick={() => {
              setLocalState(() => ({
                groupRoles: [...groupRoles, { groupId: undefined, roles: [] }],
              }));
            }}
          >
            Add group roles
          </Button>
        </FlexBox>
      ) : groupRoles.length > 0 ? (
        <Table
          titleVariant="caption"
          itemRenderer={itemRenderer}
          items={groupRoles}
          rowKeyExtractor={({ groupId }) => groupId ?? ''}
          disableBottomBorder
        />
      ) : (
        <Typography variant="body2">No roles assigned.</Typography>
      )}
    </SettingsContainer>
  );
};
