import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import Button from './Button';
import { Flex } from './Flex';
import { Text } from './Text';
import { EmailProviderLink, emailProviderInfo } from './EmailProviderLink';

export const EmailConfirmation = ({
  emailDomain,
  reset,
  email,
}: {
  emailDomain: string | null;
  reset: () => void;
  email: string;
}) => {
  const { t } = useLingui();

  return (
    <Flex direction="column" gap={24}>
      <Text size="header">{t({ id: 'emailConfirmation.title', message: 'Check your email' })}</Text>
      <Flex direction="column" gap={12}>
        <Text>
          <Trans
            id="emailConfirmation.content"
            message="An email was sent to <bold>{email}</bold>."
            components={{ bold: <b /> }}
            values={{ email }}
          />
        </Text>
        <Flex direction="column" gap={8}>
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.gmail} />
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.yahoo} />
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.outlook} />
        </Flex>
      </Flex>
      <Button type="button" onClick={reset}>
        {t({ id: 'button.retry', message: 'Try again' })}
      </Button>
    </Flex>
  );
};
