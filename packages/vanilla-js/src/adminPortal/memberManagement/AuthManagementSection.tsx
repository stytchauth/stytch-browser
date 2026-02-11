import { Member } from '@stytch/core/public';
import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { FlexBox } from '../components/FlexBox';
import { Modal, useModalState } from '../components/Modal';
import { SettingsContainer } from '../components/SettingsContainer';
import { SettingsSection } from '../components/SettingsSection';
import { Typography } from '../components/Typography';
import { memberGetKey } from '../utils/memberGetKey';
import { useMutateWithToast } from '../utils/useMutateWithToast';
import { useRbac } from '../utils/useRbac';
import { useStytchClient } from '../utils/useStytchClient';
import { useMemberManagementRouterController } from './MemberManagementRouter';
import { useSelf } from '../utils/useSelf';

export const AuthManagementSection = ({ member }: { member: Member }) => {
  const { isSelf } = useSelf();
  const isMemberSelf = isSelf(member.member_id);

  const { data: canDeleteMemberMfaPhonePerm } = useRbac('stytch.member', 'update.info.delete.mfa-phone');
  const { data: canDeleteMemberMfaTotpPerm } = useRbac('stytch.member', 'update.info.delete.mfa-totp');
  const { data: canDeleteMemberPasswordPerm } = useRbac('stytch.member', 'update.info.delete.password');
  const { data: canRevokeMemberSessionsPerm } = useRbac('stytch.member', 'revoke-sessions');

  const { data: canDeleteSelfMfaPhonePerm } = useRbac('stytch.self', 'update.info.delete.mfa-phone');
  const { data: canDeleteSelfMfaTotpPerm } = useRbac('stytch.self', 'update.info.delete.mfa-totp');
  const { data: canDeleteSelfPasswordPerm } = useRbac('stytch.self', 'update.info.delete.password');
  const { data: canRevokeSelfSessionsPerm } = useRbac('stytch.self', 'revoke-sessions');

  const canDeleteMfaPhonePerm = canDeleteMemberMfaPhonePerm || (canDeleteSelfMfaPhonePerm && isMemberSelf);
  const canDeleteMfaTotpPerm = canDeleteMemberMfaTotpPerm || (canDeleteSelfMfaTotpPerm && isMemberSelf);

  const memberHasMfaPhone = !!member.mfa_phone_number;
  const memberHasTotp = !!member.totp_registration_id;

  const canDeleteMfaPhone = canDeleteMfaPhonePerm && memberHasMfaPhone;
  const canDeleteMfaTotp = canDeleteMfaTotpPerm && memberHasTotp;
  const canDeletePassword = canDeleteMemberPasswordPerm || (canDeleteSelfPasswordPerm && isMemberSelf);
  const canRevokeSessions = canRevokeMemberSessionsPerm || (canRevokeSelfSessionsPerm && isMemberSelf);

  const canPerformAnyAction = canDeleteMfaPhone || canDeleteMfaTotp || canDeletePassword || canRevokeSessions;

  const client = useStytchClient();
  const { mutate: mutateSWR } = useSWRConfig();

  const { mutate: deleteMfaTotp } = useMutateWithToast(async (memberId: string) => {
    await mutateSWR(
      memberGetKey(memberId),
      async () => {
        const result = await client.organization.members.deleteMFATOTP(memberId);
        return result.member;
      },
      {
        populateCache: true,
        revalidate: false,
      },
    );
  });
  const { open: openResetMfaTotpModal, ...resetMfaTotpModalProps } = useModalState(() => {
    return deleteMfaTotp(member.member_id);
  });

  const { mutate: deleteMfaPhoneNumber } = useMutateWithToast(async (memberId: string) => {
    await mutateSWR(
      memberGetKey(memberId),
      async () => {
        const result = await client.organization.members.deleteMFAPhoneNumber(memberId);
        return result.member;
      },
      {
        populateCache: true,
        revalidate: false,
      },
    );
  });
  const { open: openResetMfaPhoneNumberModal, ...resetMfaPhoneNumberModalProps } = useModalState(() => {
    return deleteMfaPhoneNumber(member.member_id);
  });

  const [sendPasswordReset, setSendPasswordReset] = useState(false);
  const { mutate: resetPassword } = useMutateWithToast(async (memberId: string) => {
    await mutateSWR(
      memberGetKey(memberId),
      async () => {
        const result = member.member_password_id
          ? (await client.organization.members.deletePassword(member.member_password_id)).member
          : member;

        if (sendPasswordReset) {
          await client.passwords.resetByEmailStart({
            email_address: member.email_address,
            organization_id: member.organization_id,
          });
        }

        return result;
      },
      {
        populateCache: true,
        revalidate: false,
      },
    );
  });
  const { open: openResetPasswordModal, ...resetPasswordModalProps } = useModalState(() => {
    return resetPassword(member.member_id);
  });

  const { mutate: revokeSessions } = useMutateWithToast(async (memberId: string) => {
    await mutateSWR(memberGetKey(memberId), async () => {
      await client.session.revokeForMember({ member_id: memberId });
    });
  });
  const { open: openRevokeSessionsModal, ...revokeSessionsModalProps } = useModalState(() => {
    return revokeSessions(member.member_id);
  });

  const { useBlockNavigation } = useMemberManagementRouterController();

  return canPerformAnyAction ? (
    <SettingsContainer title="Authentication management" useBlockNavigation={useBlockNavigation}>
      <FlexBox flexDirection="column" gap={2}>
        {(canDeleteMfaPhone || canDeleteMfaTotp) && (
          <SettingsSection title="MFA">
            <Typography variant="body2">
              Reset the Member’s MFA enrollment. If necessary, the Member will have to re-enroll in MFA the next time
              they login.
            </Typography>
            <FlexBox gap={1}>
              {canDeleteMfaTotp && (
                <>
                  <Modal
                    {...resetMfaTotpModalProps}
                    title="Reset Member’s TOTP enrollment"
                    confirmButtonText="Reset TOTP"
                    warning
                  >
                    <Typography>
                      Reset the Member’s TOTP enrollment. If necessary, the Member will have to re-enroll in MFA the
                      next time they login.
                    </Typography>
                  </Modal>
                  <Button compact variant="ghost" onClick={openResetMfaTotpModal}>
                    Reset TOTP
                  </Button>
                </>
              )}
              {canDeleteMfaPhone && (
                <>
                  <Modal
                    {...resetMfaPhoneNumberModalProps}
                    title="Reset Member’s SMS OTP enrollment"
                    confirmButtonText="Reset SMS OTP"
                    warning
                  >
                    <Typography>
                      Reset the Member’s SMS OTP enrollment. If necessary, the Member will have to re-enroll in MFA the
                      next time they login.
                    </Typography>
                  </Modal>
                  <Button compact variant="ghost" onClick={openResetMfaPhoneNumberModal}>
                    Reset SMS OTP
                  </Button>
                </>
              )}
            </FlexBox>
          </SettingsSection>
        )}
        {canDeletePassword && (
          <SettingsSection title="Password">
            <Modal
              {...resetPasswordModalProps}
              title="Ask Member to reset their password?"
              confirmButtonText="Reset password"
              warning
            >
              <Typography>
                Delete the member’s current password and optionally trigger a password reset email by checking the box
                below.
              </Typography>
              <Typography>
                The Member will need to set a new password or use a passwordless authentication method (if allowed by
                your auth policy) in order to login again.
              </Typography>
              <Checkbox
                label="Trigger password reset email"
                checked={sendPasswordReset}
                onClick={(checked) => {
                  setSendPasswordReset(checked);
                }}
              />
            </Modal>
            <Typography variant="body2">
              Forcing a password reset will delete the Member’s current password and send a reset password email.
            </Typography>
            <Button compact variant="ghost" onClick={openResetPasswordModal}>
              Reset password
            </Button>
          </SettingsSection>
        )}
        {canRevokeSessions && (
          <SettingsSection title="Sessions">
            <Modal
              {...revokeSessionsModalProps}
              title="Revoke Member’s active sessions"
              confirmButtonText="Revoke all sessions"
              warning
            >
              <Typography>
                The Member will be force logged out and all their active sessions will be revoked.
              </Typography>
            </Modal>
            <Typography variant="body2">Force logout this Member. All active sessions will be revoked.</Typography>
            <Button compact variant="ghost" onClick={openRevokeSessionsModal}>
              Revoke all sessions
            </Button>
          </SettingsSection>
        )}
      </FlexBox>
    </SettingsContainer>
  ) : null;
};
