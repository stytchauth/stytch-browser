import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import React from 'react';

import type { emailIcons } from '../../b2c/components/Icons';
import { ButtonAnchor } from '../atoms/Button';
import { usePresentation } from '../PresentationConfig';

type EmailProvider = 'gmail' | 'yahoo' | 'outlook';

export interface EmailProviderInfo {
  messageDescriptor: MessageDescriptor;
  icon: keyof typeof emailIcons;
  getUrl: (emailDomain: string | null) => string;
}

export const emailProviderInfo = {
  gmail: {
    messageDescriptor: msg({ id: 'link.openInGmail', message: 'Open in Gmail' }),
    icon: 'gmail',
    getUrl: (emailDomain: string | null) => {
      const gmailQuery = encodeURIComponent(emailDomain ? `from:@${emailDomain} in:anywhere` : 'in:anywhere');
      return `https://mail.google.com/mail/u/0/#search/${gmailQuery}`;
    },
  },
  yahoo: {
    messageDescriptor: msg({ id: 'link.openInYahoo', message: 'Open in Yahoo' }),
    icon: 'yahoo',
    getUrl: (emailDomain: string | null) => {
      return !emailDomain
        ? 'https://mail.yahoo.com/d/search/referrer=unread'
        : `https://mail.yahoo.com/d/search/keyword=${emailDomain}`;
    },
  },
  outlook: {
    messageDescriptor: msg({ id: 'link.openInOutlook', message: 'Open in Outlook' }),
    icon: 'outlook',
    getUrl: () => `https://outlook.office.com/mail/0/inbox`,
  },
} satisfies Record<EmailProvider, EmailProviderInfo>;

type EmailProviderProps = {
  providerInfo: EmailProviderInfo;
  emailDomain: string | null;
};

export const EmailProviderLink = ({
  providerInfo: { icon, messageDescriptor, getUrl },
  emailDomain,
}: EmailProviderProps) => {
  const { t } = useLingui();
  const href = getUrl(emailDomain);
  const { iconRegistry } = usePresentation();

  const Icon = iconRegistry[icon];

  return (
    <ButtonAnchor variant="outline" href={href} target="_blank" rel="noopener noreferrer" icon={<Icon />}>
      {t(messageDescriptor)}
    </ButtonAnchor>
  );
};
