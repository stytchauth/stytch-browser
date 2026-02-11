import { useCallback } from 'react';

import { useToast } from '../shared/components/Toast';
import { useAdminPortalMemberManagementUIConfig } from '../StytchClientContext';
import { useStytchClient } from '../utils/useStytchClient';

export type SendInviteEmail = (
  email_address: string,
  additionalOptions?: { name?: string; roles?: string[] },
) => Promise<void>;

export function useSendInviteEmail({ onSuccess }: { onSuccess?: () => unknown }) {
  const client = useStytchClient();
  const uiConfig = useAdminPortalMemberManagementUIConfig();
  const { openToast } = useToast();

  return useCallback<SendInviteEmail>(
    async (email_address, additionalOptions = {}) => {
      const trimmedEmail = email_address.trim();
      await client.magicLinks.email.invite({
        ...additionalOptions,
        email_address: trimmedEmail,
        invite_template_id: uiConfig?.inviteTemplateId,
        invite_redirect_url: uiConfig?.inviteRedirectURL,
      });

      openToast({
        text: `Invite sent to ${trimmedEmail}`,
        type: 'success',
      });

      await onSuccess?.();
    },
    [client, uiConfig?.inviteTemplateId, uiConfig?.inviteRedirectURL, openToast, onSuccess],
  );
}
