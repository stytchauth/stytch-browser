import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import BackArrowIcon from '../../assets/backArrow';
import { useGlobalReducer } from '../b2b/GlobalContextProvider';
import { AppScreens } from '../b2b/types/AppScreens';
import { EmailProviderLink, emailProviderInfo } from './EmailProviderLink';
import { Flex } from './Flex';
import { Text } from './Text';
import { HelpButton } from './HelpButton';

export const VerifyEmailConfirmation = ({
  emailDomain,
  reset,
  email,
}: {
  emailDomain: string | null;
  reset: () => void;
  email: string;
}) => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">
        {t({
          id: 'password.verification.title',
          message: 'Verify your email first.',
        })}
      </Text>
      <Flex direction="column" gap={12}>
        <Text>
          <Trans
            id="password.verification.content"
            message="A login link was sent to you at <bold>{email}</bold>."
            components={{ bold: <b /> }}
            values={{ email }}
          />
        </Text>
        <Flex direction="column" gap={8}>
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.gmail} />
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.outlook} />
        </Flex>
      </Flex>
      <Flex direction="row">
        <Text color="secondary">
          <Trans
            id="password.verification.resendEmail"
            message="Didn't get it? <resendButton>Resend email</resendButton>"
            components={{
              resendButton: <HelpButton onClick={reset} />,
            }}
          />
        </Text>
      </Flex>
    </Flex>
  );
};
