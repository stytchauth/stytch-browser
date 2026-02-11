import { RBACPolicyRole } from '@stytch/core';
import { B2BOrganizationsMembersUpdateOptions, Member, MemberRole } from '@stytch/core/public';
import React, { SetStateAction, useCallback, useMemo, useRef, useState } from 'react';
import { Autocomplete } from '../components/Autocomplete';
import { FlexBox } from '../components/FlexBox';
import { ListEditor } from '../components/ListEditor';
import { Modal, useModalState } from '../components/Modal';
import { SettingsContainer, useSettingsContainer } from '../components/SettingsContainer';
import { SettingsSection } from '../components/SettingsSection';
import { Switch } from '../components/Switch';
import { Typography } from '../components/Typography';
import { TableItemRenderer } from '../shared/components/types';
import { arraysHaveSameContents } from '../utils/arraysHaveSameContents';
import { ROLE_ID_STYTCH_MEMBER } from '../utils/roles';
import { useFormState } from '../utils/useFormState';
import { useMutateMember } from '../utils/useMutateMember';
import { useRbac } from '../utils/useRbac';
import { useRoleAutocomplete } from '../utils/useRoleAutocomplete';
import { useRoleDisplayInfo } from '../utils/useRoleDisplayInfo';
import { useRoleSortFn } from '../utils/useRoleSortFn';
import { useRoles } from '../utils/useRoles';
import { useSelf } from '../utils/useSelf';
import { useStateSliceSetter } from '../utils/useStateSliceSetter';
import { useMemberManagementRouterController } from './MemberManagementRouter';

type RoleSourceType = MemberRole['sources'][number]['type'];

interface AccessFormState {
  isBreakglass: boolean;
  isMfaEnrolled: boolean;
  explicitRoleAssignments: string[];
}

interface AccessSectionBodyProps {
  localState: AccessFormState;
  setLocalState: (state: SetStateAction<AccessFormState>) => void;
  remoteState: AccessFormState;
  implicitRoleAssignments: { role_id: string; sourceType: RoleSourceType }[];
  showRoleAssignment: boolean;
  isSelf: boolean;
  orgRequiresMfa: boolean;
}

const getRoleSourceTypeDisplayName = (sourceType: RoleSourceType) => {
  switch (sourceType) {
    case 'direct_assignment':
      return 'Manual assignment';
    case 'email_assignment':
      return 'Email domain';
    case 'sso_connection':
      return 'SSO connection';
    case 'sso_connection_group':
      return 'SSO group';
    case 'scim_connection_group':
      return 'SCIM group';
    default:
      return sourceType;
  }
};

const roleAssignmentsRowKeyExtractor = (item: { role_id: string; sourceType: RoleSourceType }): string =>
  `${item.role_id}-${item.sourceType}`;

const AccessSectionBody = ({
  localState,
  setLocalState,
  remoteState,
  implicitRoleAssignments,
  showRoleAssignment,
  isSelf,
  orgRequiresMfa,
}: AccessSectionBodyProps) => {
  const { editing } = useSettingsContainer();

  const { isMfaEnrolled, explicitRoleAssignments, isBreakglass } = editing ? localState : remoteState;

  const handleIsMfaEnrolledChange = useStateSliceSetter(setLocalState, 'isMfaEnrolled');
  const setIsBreakglass = useStateSliceSetter(setLocalState, 'isBreakglass');

  const { open: openBreakGlassConfirmModal, ...breakGlassConfirmModalProps } = useModalState(() => {
    setIsBreakglass(true);
  });

  const handleIsBreakglassChange = useCallback(
    (value: boolean) => {
      if (value) {
        openBreakGlassConfirmModal();
      } else {
        setIsBreakglass(value);
      }
    },
    [openBreakGlassConfirmModal, setIsBreakglass],
  );

  const { data: canUpdateMemberRolesPerm } = useRbac('stytch.member', 'update.settings.roles');
  const { data: canUpdateMemberMfaEnrolledPerm } = useRbac('stytch.member', 'update.settings.mfa-enrolled');
  const { data: canUpdateMemberBreakglassPerm } = useRbac('stytch.member', 'update.settings.is-breakglass');

  const { data: canUpdateSelfMfaEnrolledPerm } = useRbac('stytch.self', 'update.settings.mfa-enrolled');

  const { data: canGetOrgCustomRoles } = useRbac('stytch.custom-org-roles', 'get');

  const canUpdateMfaEnrolled = canUpdateMemberMfaEnrolledPerm || (canUpdateSelfMfaEnrolledPerm && isSelf);
  const canUpdateRoles = canUpdateMemberRolesPerm;
  const canUpdateBreakglass = canUpdateMemberBreakglassPerm;

  const sortRoles = useRoleSortFn();

  const { selectItems: roleSelectItems, ...roleAutocompleteProps } = useRoleAutocomplete({
    excludeStytchMember: true,
    includeOrgRoles: canGetOrgCustomRoles,
  });
  const availableRoleSelectItems = roleSelectItems.filter((roleId) => !explicitRoleAssignments.includes(roleId));

  const { getRoleIdDisplayName } = useRoleDisplayInfo(canGetOrgCustomRoles);

  const stytchMemberRoleDisplayName = roleAutocompleteProps.getOptionLabel(ROLE_ID_STYTCH_MEMBER);

  const combinedRoleAssignments = useMemo(() => {
    return [
      ...sortRoles(implicitRoleAssignments),
      ...sortRoles(
        explicitRoleAssignments.map((roleId) => ({ role_id: roleId, sourceType: 'direct_assignment' as const })),
      ),
    ];
  }, [explicitRoleAssignments, implicitRoleAssignments, sortRoles]);

  const [pendingAssignments, setPendingAssignments] = useState<string[]>([]);
  const { open: openRoleAssignmentModal, ...roleAssignmentModalProps } = useModalState(() => {
    setLocalState((state) => {
      return {
        ...state,
        explicitRoleAssignments: Array.from(new Set([...state.explicitRoleAssignments, ...pendingAssignments])),
      };
    });
  });

  const roleAssignmentsItemRenderer: TableItemRenderer<(typeof combinedRoleAssignments)[number]>[] = useMemo(
    () => [
      {
        title: 'Role',
        getValue: (assignment) => <Typography variant="body2">{getRoleIdDisplayName(assignment.role_id)}</Typography>,
      },
      {
        title: 'Source',
        getValue: (assignment) => (
          <Typography variant="body2">{getRoleSourceTypeDisplayName(assignment.sourceType)}</Typography>
        ),
      },
    ],
    [getRoleIdDisplayName],
  );

  const handleAddRoleAssignment = useCallback(() => {
    setPendingAssignments([]);
    openRoleAssignmentModal();
  }, [openRoleAssignmentModal]);

  const roleAssignmentsItemActionProps = useMemo(
    () => (item: (typeof combinedRoleAssignments)[number]) =>
      item.sourceType === 'direct_assignment'
        ? {
            warningAction: {
              text: 'Revoke',
              onClick: () => {
                setLocalState((state) => {
                  return {
                    ...state,
                    explicitRoleAssignments: state.explicitRoleAssignments.filter((roleId) => roleId !== item.role_id),
                  };
                });
              },
            },
          }
        : {},
    [setLocalState],
  );

  return (
    <FlexBox flexDirection="column" gap={2}>
      {editing && (
        <Modal
          {...breakGlassConfirmModalProps}
          title="Exempt Member from primary auth requirements?"
          confirmButtonText="Allow"
          warning
        >
          <Typography>
            Enabling this toggle will exempt the Member from your primary authentication policy if needed (e.g. to
            update SSO configuration in the case of a lockout).
          </Typography>
        </Modal>
      )}
      {showRoleAssignment && (
        <SettingsSection title="Role assignments">
          <Modal {...roleAssignmentModalProps} title="Add Role assignment" confirmButtonText="Add Role">
            <FlexBox flexDirection="column" gap={0.5}>
              <Typography color="secondary" variant="caption">
                Role
              </Typography>
              <Autocomplete
                {...roleAutocompleteProps}
                selectItems={availableRoleSelectItems}
                value={pendingAssignments}
                onChange={setPendingAssignments}
                placeholder={pendingAssignments.length > 0 ? undefined : 'Select Role'}
              />
            </FlexBox>
          </Modal>
          <Typography variant="body2">
            All members are automatically assigned the {stytchMemberRoleDisplayName} Role.
          </Typography>
          <ListEditor
            items={combinedRoleAssignments}
            rowKeyExtractor={roleAssignmentsRowKeyExtractor}
            itemRenderer={roleAssignmentsItemRenderer}
            addButtonText="Add Role assignment"
            hideAddButton={availableRoleSelectItems.length === 0}
            readOnly={!(editing && canUpdateRoles)}
            onAdd={handleAddRoleAssignment}
            getItemActionProps={roleAssignmentsItemActionProps}
          />
        </SettingsSection>
      )}
      <SettingsSection title="Require MFA">
        {orgRequiresMfa ? (
          <Typography variant="body2">MFA is required for all members.</Typography>
        ) : (
          <Switch
            readOnly={!editing || !canUpdateMfaEnrolled}
            checked={isMfaEnrolled}
            onChange={handleIsMfaEnrolledChange}
            label="Require MFA for this Member. When enabled, the Member will be required to set up and use MFA on each login."
          />
        )}
      </SettingsSection>
      <SettingsSection title="Exempt from primary auth requirements">
        <Switch
          readOnly={!editing || !canUpdateBreakglass}
          checked={isBreakglass}
          onChange={handleIsBreakglassChange}
          label="Exempt Member from your primary authentication policy"
        />
      </SettingsSection>
    </FlexBox>
  );
};

const rolesCanUpdateMemberRoles = (roleIds: string[], roles: RBACPolicyRole[]) => {
  return Array.from(new Set(roleIds)).some((roleId) => {
    const role = roles.find((role) => role.role_id === roleId);
    return role?.permissions.some(
      (permission) =>
        permission.resource_id === 'stytch.member' &&
        (permission.actions.includes('update.settings.roles') || permission.actions.includes('*')),
    );
  });
};

export const AccessSection = ({ member, orgRequiresMfa }: { member: Member; orgRequiresMfa: boolean }) => {
  const { isSelf } = useSelf();
  const isMemberSelf = isSelf(member.member_id);
  const { data: canUpdateMemberRolesPerm } = useRbac('stytch.member', 'update.settings.roles');
  const { data: canUpdateMemberBreakglassPerm } = useRbac('stytch.member', 'update.settings.is-breakglass');
  const { data: canUpdateMemberMfaEnrolledPerm } = useRbac('stytch.member', 'update.settings.mfa-enrolled');

  const { data: canUpdateSelfMfaEnrolledPerm } = useRbac('stytch.self', 'update.settings.mfa-enrolled');

  const { data: canGetOrgCustomRoles } = useRbac('stytch.custom-org-roles', 'get');

  const canUpdateRoles = canUpdateMemberRolesPerm;
  const canUpdateBreakglass = canUpdateMemberBreakglassPerm;
  const canUpdateMfaEnrolled =
    !orgRequiresMfa && (canUpdateMemberMfaEnrolledPerm || (canUpdateSelfMfaEnrolledPerm && isMemberSelf));

  const isMemberDeleted = member.status === 'deleted';

  const canEditSection = !isMemberDeleted && (canUpdateRoles || canUpdateBreakglass || canUpdateMfaEnrolled);
  const showRoleAssignment = !isMemberDeleted;

  const { explicitRoleAssignments, implicitRoleAssignments } = useMemo(() => {
    return member.roles
      .filter((role) => role.role_id !== ROLE_ID_STYTCH_MEMBER)
      .reduce<{
        explicitRoleAssignments: string[];
        implicitRoleAssignments: { role_id: string; sourceType: RoleSourceType }[];
      }>(
        (acc, role) => {
          const implicitAssignments = new Set(
            role.sources.filter((source) => source.type !== 'direct_assignment').map((source) => source.type),
          );
          for (const sourceType of implicitAssignments) {
            acc.implicitRoleAssignments.push({ role_id: role.role_id, sourceType });
          }

          const isExplicitAssignment = role.sources.some((source) => source.type === 'direct_assignment');
          if (isExplicitAssignment) {
            acc.explicitRoleAssignments.push(role.role_id);
          }

          return acc;
        },
        {
          explicitRoleAssignments: [],
          implicitRoleAssignments: [],
        },
      );
  }, [member.roles]);

  const remoteState = useMemo<AccessFormState>(
    () => ({
      isMfaEnrolled: member.mfa_enrolled,
      explicitRoleAssignments,
      isBreakglass: member.is_breakglass,
    }),
    [explicitRoleAssignments, member.is_breakglass, member.mfa_enrolled],
  );

  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });

  const { mutate } = useMutateMember();

  const lockoutConfirmDeferred = useRef<{ resolve: () => void; reject: () => void }>();

  const {
    open: openLockoutWarningModal,
    close: closeLockoutWarningModal,
    ...lockoutWarningModalProps
  } = useModalState(() => {
    lockoutConfirmDeferred.current?.resolve();
    lockoutConfirmDeferred.current = undefined;
  });
  const handleLockoutWarningCancel = useCallback(() => {
    lockoutConfirmDeferred.current?.reject();
    lockoutConfirmDeferred.current = undefined;
    closeLockoutWarningModal();
  }, [closeLockoutWarningModal]);

  const roles = useRoles(canGetOrgCustomRoles);

  const handleSave = useCallback(async () => {
    const memberOptions: B2BOrganizationsMembersUpdateOptions = {
      member_id: member.member_id,
    };

    let shouldUpdate = false;
    const setOption = <T extends keyof B2BOrganizationsMembersUpdateOptions>(
      key: T,
      value: B2BOrganizationsMembersUpdateOptions[T],
    ) => {
      memberOptions[key] = value;
      shouldUpdate = true;
    };

    if (localState.isMfaEnrolled !== remoteState.isMfaEnrolled) {
      setOption('mfa_enrolled', localState.isMfaEnrolled);
    }
    if (localState.isBreakglass !== remoteState.isBreakglass) {
      setOption('is_breakglass', localState.isBreakglass);
    }
    if (!arraysHaveSameContents(localState.explicitRoleAssignments, remoteState.explicitRoleAssignments)) {
      if (
        isSelf(member.member_id) &&
        roles &&
        !rolesCanUpdateMemberRoles(
          [...localState.explicitRoleAssignments, ...implicitRoleAssignments.map((role) => role.role_id)],
          roles,
        )
      ) {
        openLockoutWarningModal();
        await new Promise<void>((resolve, reject) => {
          lockoutConfirmDeferred.current = { resolve, reject };
        });
      }

      setOption('roles', localState.explicitRoleAssignments);
    }

    if (shouldUpdate) {
      await mutate(memberOptions);
    }
  }, [
    implicitRoleAssignments,
    isSelf,
    localState.explicitRoleAssignments,
    localState.isBreakglass,
    localState.isMfaEnrolled,
    member.member_id,
    mutate,
    openLockoutWarningModal,
    remoteState.explicitRoleAssignments,
    remoteState.isBreakglass,
    remoteState.isMfaEnrolled,
    roles,
  ]);

  const { useBlockNavigation } = useMemberManagementRouterController();

  return (
    <SettingsContainer
      title="Access requirements & permissions"
      hasCTA={canEditSection}
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      setEditing={handleSetEditing}
    >
      <Modal
        {...lockoutWarningModalProps}
        close={handleLockoutWarningCancel}
        title="Revoke Role assignments?"
        confirmButtonText="Revoke"
        warning
      >
        <Typography>
          Changing your Role assignments will remove your permissions to manage members. You will not be able to edit
          your Role assignments to reassign permissions.
        </Typography>
      </Modal>
      <AccessSectionBody
        remoteState={remoteState}
        localState={localState}
        setLocalState={setLocalState}
        implicitRoleAssignments={implicitRoleAssignments}
        showRoleAssignment={showRoleAssignment}
        isSelf={isMemberSelf}
        orgRequiresMfa={orgRequiresMfa}
      />
    </SettingsContainer>
  );
};
