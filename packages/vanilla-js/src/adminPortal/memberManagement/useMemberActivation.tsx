import { Member } from '@stytch/core/public';
import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Modal, useModalState } from '../components/Modal';
import { Typography } from '../components/Typography';
import { memberGetKey } from '../utils/memberGetKey';
import { useMutateWithToast } from '../utils/useMutateWithToast';
import { useStytchClient } from '../utils/useStytchClient';
import { useUpdateCachedMember } from '../utils/useUpdateCachedMember';
import { KnownMemberStatus } from './MemberStatus';

export const getActionCopy = ({ status, isEmailVerified }: { status: string; isEmailVerified: boolean }) => {
  if ((status as KnownMemberStatus) === 'invited') {
    const description =
      'The invited Member will be deleted and cannot be reactivated. Resending an invite to this email will create a new Member record.';
    return {
      action: 'Revoke invite',
      description,
      modalTitle: 'Revoke invite?',
      modalAction: 'Revoke invite',
      modalDescription: description,
    };
  }

  if ((status as KnownMemberStatus) === 'deleted') {
    const description = 'Reactivating the Member will allow them to log in under their previous account.';
    return {
      action: 'Reactivate Member',
      description,
      modalTitle: 'Reactivate Member?',
      modalAction: 'Reactivate',
      modalDescription: description,
    };
  }

  const description = isEmailVerified
    ? 'All of the Member’s authentication factors will be deleted and all active sessions will be revoked. You will be able to reactivate the Member and restore their email, but other authentication factors and Role assignments will not be restored.'
    : 'All of the Member’s authentication factors will be deleted and all active sessions will be revoked. The Member’s email is not verified, so you will not be able to reactivate the Member or restore their email.';

  const modalDescription = isEmailVerified ? (
    description
  ) : (
    <>
      <Typography>
        All of the Member’s authentication factors will be deleted and all active sessions will be revoked.
      </Typography>
      <Typography color="error">
        The Member’s email is not verified, so you will not be able to reactivate the Member or restore their email.
      </Typography>
    </>
  );
  return {
    action: 'Deactivate Member',
    description,
    modalTitle: 'Deactivate Member?',
    modalAction: 'Deactivate Member',
    modalDescription,
  };
};

export const useMemberActivation = (revalidateMemberList?: () => void) => {
  const client = useStytchClient();
  const { mutate: mutateSWR } = useSWRConfig();

  const { mutate: deleteMember } = useMutateWithToast(async (memberId: string) => {
    return await mutateSWR(memberGetKey(memberId), async () => {
      await client.organization.members.delete(memberId);
    });
  });

  const { mutate: reactivateMember } = useMutateWithToast(async (memberId: string) => {
    return await mutateSWR(
      memberGetKey(memberId),
      async () => {
        const result = await client.organization.members.reactivate(memberId);
        return result.member;
      },
      {
        populateCache: true,
        revalidate: false,
      },
    );
  });

  const { markMemberDeleted, setMember } = useUpdateCachedMember();

  // Store a cached member upon opening the confirmation modal so that the
  // action being confirmed does not change after the confirmation modal is
  // shown. e.g., if an admin clicks "deactivate" for an active member just
  // before the Member is deactivated out of band, we do not want the admin
  // "confirming" the action to erroneously reactivate the (now-deleted) Member.
  const [memberPendingAction, setMemberPendingAction] = useState<Member>();

  const {
    open: openConfirmationModal,
    close: closeConfirmationModal,
    ...deleteMemberModalProps
  } = useModalState(async () => {
    if (!memberPendingAction) {
      // member should be available at this point
      return;
    }

    if (memberPendingAction.status === 'deleted') {
      const member = await reactivateMember(memberPendingAction.member_id);
      if (member) {
        setMember(member);
      }
    } else {
      await deleteMember(memberPendingAction.member_id);
      markMemberDeleted(memberPendingAction.member_id);
    }
    revalidateMemberList?.();
  });

  const close = () => {
    closeConfirmationModal();
  };

  const openModal = (member: Member) => {
    setMemberPendingAction(member);
    openConfirmationModal();
  };

  const actionCopy = getActionCopy({
    status: memberPendingAction?.status ?? 'active',
    isEmailVerified: memberPendingAction?.email_address_verified ?? false,
  });

  const modal = (
    <Modal
      {...deleteMemberModalProps}
      close={close}
      title={actionCopy.modalTitle}
      confirmButtonText={actionCopy.modalAction}
      warning
    >
      {typeof actionCopy.modalDescription === 'string' ? (
        <Typography>{actionCopy.modalDescription}</Typography>
      ) : (
        actionCopy.modalDescription
      )}
    </Modal>
  );

  return {
    openModal,
    modal,
  };
};
