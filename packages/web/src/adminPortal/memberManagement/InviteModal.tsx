import React, { useCallback, useState } from 'react';

import { passwordManagerDisableAutofillProps } from '../../utils/passwordManagerDisableAutofillProps';
import { Autocomplete } from '../components/Autocomplete';
import { Input } from '../components/Input';
import { Modal, ModalStateType, useModalState } from '../components/Modal';
import { ROLE_ID_STYTCH_MEMBER } from '../utils/roles';
import { useRbac } from '../utils/useRbac';
import { useRoleAutocomplete } from '../utils/useRoleAutocomplete';
import type { SendInviteEmail } from './useSendInviteEmail';

const defaultInviteRoles: string[] = [];

interface InviteModalProps {
  modalState: Omit<ModalStateType, 'open'>;
  inviteName: string;
  setInviteName: (value: string) => void;
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  inviteRoles: string[];
  setInviteRoles: (value: string[]) => void;
}

export const useInviteModal = (inviteUser: SendInviteEmail) => {
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoles, setInviteRoles] = useState(defaultInviteRoles);

  const { open: openInviteModal, ...modalState } = useModalState(async () => {
    await inviteUser(inviteEmail, { name: inviteName, roles: inviteRoles });
    modalState.close();
  });

  const handleInviteClick = useCallback(() => {
    setInviteName('');
    setInviteEmail('');
    setInviteRoles(defaultInviteRoles);

    openInviteModal();
  }, [openInviteModal]);

  return {
    handleInviteClick,
    inviteModalProps: {
      modalState,
      inviteName,
      setInviteName,
      inviteEmail,
      setInviteEmail,
      inviteRoles,
      setInviteRoles,
    } satisfies InviteModalProps,
  };
};

export const InviteModal = ({
  modalState,
  inviteEmail,
  inviteName,
  inviteRoles,
  setInviteEmail,
  setInviteName,
  setInviteRoles,
}: InviteModalProps) => {
  const { data: canGetOrgCustomRoles } = useRbac('stytch.custom-org-roles', 'get');

  const roleAutocompleteProps = useRoleAutocomplete({
    excludeStytchMember: true,
    includeOrgRoles: canGetOrgCustomRoles ?? false,
  });

  const stytchMemberRoleDisplayName = roleAutocompleteProps.getOptionLabel(ROLE_ID_STYTCH_MEMBER);

  const formIsValid = inviteEmail.trim().length > 0;

  return (
    <Modal
      {...modalState}
      keepOpenOnConfirm
      title="Invite Member"
      confirmButtonText="Invite"
      disableConfirm={!formIsValid}
    >
      <Input label="Name (optional)" placeholder="Enter name" value={inviteName} onChange={setInviteName} />
      <Input
        label="Email address"
        placeholder="Enter email address"
        value={inviteEmail}
        onChange={setInviteEmail}
        inputProps={passwordManagerDisableAutofillProps}
      />
      <Autocomplete
        {...roleAutocompleteProps}
        placeholder={inviteRoles.length > 0 ? undefined : 'Select Role'}
        label="Role"
        caption={`All members are automatically assigned the ${stytchMemberRoleDisplayName} Role. Select additional Roles to assign more permissions.`}
        value={inviteRoles}
        onChange={setInviteRoles}
      />
    </Modal>
  );
};
