import { Member } from '@stytch/core/public';
import React, { useCallback } from 'react';
import { Button } from '../components/Button';
import { FlexBox } from '../components/FlexBox';
import { SettingsContainer } from '../components/SettingsContainer';
import { Typography } from '../components/Typography';
import { useRbac } from '../utils/useRbac';
import { useMemberManagementRouterController } from './MemberManagementRouter';
import { getActionCopy, useMemberActivation } from './useMemberActivation';
import { useSelf } from '../utils/useSelf';

export const DangerZoneSection = ({ member }: { member: Member }) => {
  const { isSelf } = useSelf();
  const { data: canCreateMemberPerm } = useRbac('stytch.member', 'create');
  const { data: canDeleteMemberPerm } = useRbac('stytch.member', 'delete');

  const { data: canDeleteSelfPerm } = useRbac('stytch.self', 'delete');

  const canDelete = canDeleteMemberPerm || (canDeleteSelfPerm && isSelf(member.member_id));
  const canCreate = canCreateMemberPerm;

  const isMemberDeleted = member.status === 'deleted';
  const canMemberBeReactivated = member.email_address_verified;

  const canPerformAction = isMemberDeleted ? canCreate : canDelete;

  const { openModal, modal } = useMemberActivation();
  const actionCopy = getActionCopy({ status: member.status, isEmailVerified: member.email_address_verified });

  const handleActionClick = useCallback(() => {
    openModal(member);
  }, [member, openModal]);

  const { useBlockNavigation } = useMemberManagementRouterController();

  return canPerformAction ? (
    <SettingsContainer title="Danger zone" useBlockNavigation={useBlockNavigation}>
      <FlexBox flexDirection="column" gap={2}>
        {!isMemberDeleted || canMemberBeReactivated ? (
          <>
            {modal}
            <Typography variant="body2">{actionCopy.description}</Typography>
            <Button compact variant="ghost" warning onClick={handleActionClick}>
              {actionCopy.action}
            </Button>
          </>
        ) : (
          <Typography variant="body2">
            The Member’s email address was not verified. You cannot reactivate an unverified Member.
          </Typography>
        )}
      </FlexBox>
    </SettingsContainer>
  ) : null;
};
