import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import styled from 'styled-components';
import GmailIcon from '../../assets/gmail';
import OutlookIcon from '../../assets/outlook';
import YahooIcon from '../../assets/yahoo';
import { Flex } from './Flex';
import { Text } from './Text';

type EmailProvider = 'gmail' | 'yahoo' | 'outlook';

interface EmailProviderInfo {
  messageDescriptor: MessageDescriptor;
  icon: React.ReactNode;
  getUrl: (emailDomain: string | null) => string;
}

export const emailProviderInfo = {
  gmail: {
    messageDescriptor: msg({ id: 'link.openInGmail', message: 'Open in Gmail' }),
    icon: <GmailIcon />,
    getUrl: (emailDomain: string | null) => {
      const gmailQuery = encodeURIComponent(emailDomain ? `from:@${emailDomain} in:anywhere` : 'in:anywhere');
      return `https://mail.google.com/mail/u/0/#search/${gmailQuery}`;
    },
  },
  yahoo: {
    messageDescriptor: msg({ id: 'link.openInYahoo', message: 'Open in Yahoo' }),
    icon: <YahooIcon />,
    getUrl: (emailDomain: string | null) => {
      return !emailDomain
        ? 'https://mail.yahoo.com/d/search/referrer=unread'
        : `https://mail.yahoo.com/d/search/keyword=${emailDomain}`;
    },
  },
  outlook: {
    messageDescriptor: msg({ id: 'link.openInOutlook', message: 'Open in Outlook' }),
    icon: <OutlookIcon />,
    getUrl: () => `https://outlook.office.com/mail/0/inbox`,
  },
} satisfies Record<EmailProvider, EmailProviderInfo>;

type EmailProviderProps = {
  providerInfo: EmailProviderInfo;
  emailDomain: string | null;
};

const Link = styled.a`
  all: unset;

  cursor: pointer;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
    text-decoration-color: ${(props) => props.theme.colors.primary};
  }
`;

export const EmailProviderLink = ({
  providerInfo: { icon, messageDescriptor, getUrl },
  emailDomain,
}: EmailProviderProps) => {
  const { t } = useLingui();
  const href = getUrl(emailDomain);

  return (
    <Flex gap={4}>
      {icon}
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <Text>{t(messageDescriptor)}</Text>
      </Link>
    </Flex>
  );
};
