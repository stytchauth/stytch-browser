import { B2BOrganizationsMembersUpdateOptions, Member } from '@stytch/core/public';
import React, { SetStateAction, useCallback, useMemo } from 'react';
import { Alert } from '../components/Alert';
import { FlexBox } from '../components/FlexBox';
import { Input } from '../components/Input';
import { SettingsContainer, useSettingsContainer } from '../components/SettingsContainer';
import { SettingsList } from '../components/SettingsList';
import { SettingsListItem } from '../components/SettingsListItem';
import { Typography } from '../components/Typography';
import { NO_VALUE } from '../utils/noValue';
import { useFormState } from '../utils/useFormState';
import { useMutateMember } from '../utils/useMutateMember';
import { useRbac } from '../utils/useRbac';
import { useSelf } from '../utils/useSelf';
import { useStateSliceSetter } from '../utils/useStateSliceSetter';
import { useMemberManagementRouterController } from './MemberManagementRouter';

interface MemberDetailsFormState {
  name: string;
  emailAddress: string;
}

const MemberDetailsSectionBody = ({
  localState,
  setLocalState,
  remoteState,
  isSelf,
}: {
  localState: MemberDetailsFormState;
  setLocalState: (state: SetStateAction<MemberDetailsFormState>) => void;
  remoteState: MemberDetailsFormState;
  isSelf: boolean;
}) => {
  const { editing } = useSettingsContainer();

  const { emailAddress, name } = editing ? localState : remoteState;

  const handleNameChange = useStateSliceSetter(setLocalState, 'name');
  const handleEmailChange = useStateSliceSetter(setLocalState, 'emailAddress');

  const { data: canUpdateMemberNamePerm } = useRbac('stytch.member', 'update.info.name');
  const { data: canUpdateMemberEmailPerm } = useRbac('stytch.member', 'update.info.email');

  const { data: canUpdateSelfNamePerm } = useRbac('stytch.self', 'update.info.name');

  const canUpdateName = canUpdateMemberNamePerm || (canUpdateSelfNamePerm && isSelf);
  const canUpdateEmail = canUpdateMemberEmailPerm && !isSelf;

  const showCannotEditOwnEmailAlert = editing && canUpdateMemberEmailPerm && isSelf;

  return (
    <FlexBox flexDirection="column" gap={2}>
      {showCannotEditOwnEmailAlert && <Alert>You cannot edit your own email address.</Alert>}
      <SettingsList>
        <SettingsListItem title="Name">
          {editing && canUpdateName ? (
            <Input value={name} onChange={handleNameChange} />
          ) : (
            <Typography variant="body2">{name || NO_VALUE}</Typography>
          )}
        </SettingsListItem>
        <SettingsListItem title="Email">
          {editing && canUpdateEmail ? (
            <Input
              value={emailAddress}
              onChange={handleEmailChange}
              caption="Updating will revoke any current sessions, force a password reset, and delete SSO/OAuth registrations."
            />
          ) : (
            <Typography variant="body2">{emailAddress || NO_VALUE}</Typography>
          )}
        </SettingsListItem>
      </SettingsList>
    </FlexBox>
  );
};

export const MemberDetailsSection = ({ member }: { member: Member }) => {
  const { isSelf } = useSelf();
  const isMemberSelf = isSelf(member.member_id);
  const { data: canUpdateMemberNamePerm } = useRbac('stytch.member', 'update.info.name');
  const { data: canUpdateMemberEmailPerm } = useRbac('stytch.member', 'update.info.email');

  const { data: canUpdateSelfNamePerm } = useRbac('stytch.self', 'update.info.name');

  const canUpdateName = canUpdateMemberNamePerm || (canUpdateSelfNamePerm && isMemberSelf);
  const canUpdateEmail = canUpdateMemberEmailPerm && !isMemberSelf;

  const isMemberDeleted = member.status === 'deleted';

  const canEditSection = !isMemberDeleted && (canUpdateEmail || canUpdateName);

  const remoteState = useMemo<MemberDetailsFormState>(
    () => ({
      emailAddress: member.email_address,
      name: member.name,
    }),
    [member.email_address, member.name],
  );

  const { localState, setLocalState, editing, handleSetEditing } = useFormState({ remoteState });

  const { mutate } = useMutateMember();

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

    if (localState.name !== remoteState.name) {
      setOption('name', localState.name);
    }
    if (localState.emailAddress !== remoteState.emailAddress) {
      setOption('email_address', localState.emailAddress);
    }

    if (shouldUpdate) {
      await mutate(memberOptions);
    }
  }, [localState.emailAddress, localState.name, member.member_id, mutate, remoteState.emailAddress, remoteState.name]);

  const { useBlockNavigation } = useMemberManagementRouterController();

  return (
    <SettingsContainer
      title="Details"
      hasCTA={canEditSection}
      onSave={handleSave}
      useBlockNavigation={useBlockNavigation}
      editing={editing}
      setEditing={handleSetEditing}
    >
      <MemberDetailsSectionBody
        remoteState={remoteState}
        localState={localState}
        setLocalState={setLocalState}
        isSelf={isMemberSelf}
      />
    </SettingsContainer>
  );
};
