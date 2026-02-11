import React from 'react';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import BackArrow from '../../../assets/backArrow';
import Copy from '../../../assets/copy';
import Button from '../../components/Button';
import { Flex } from '../../components/Flex';
import { InsetContainer } from '../../components/InsetContainer';
import { Text } from '../../components/Text';
import { useGlobalReducer } from '../GlobalContextProvider';
import { useLingui } from '@lingui/react/macro';
import { AppScreens } from '../types/AppScreens';
import { BaseButton } from '../../components/BaseButton';

const CopyButton = styled(BaseButton)`
  flex: 0 0 24px;
  height: 28px;
  opacity: 0;

  :focus {
    opacity: 1;
  }
`;

const CodeContainer = styled(InsetContainer)`
  cursor: pointer;
  :hover ${CopyButton} {
    opacity: 1;
  }
`;

const Spacer = styled.div`
  flex: 0 1 24px;
`;

const Code = styled.code`
  white-space: pre-wrap;
  align-self: center;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1ch;
`;

export const TOTPEnrollManualScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  // This screen should only be shown if TOTP enrollment is available
  const { secret } = state.mfa.totp.enrollment!;

  const displaySecret = secret.toLowerCase();
  const secretChunked = displaySecret.split(/(.{4})/g).filter(Boolean);

  const handleBack = () => dispatch({ type: 'navigate_back' });

  const handleContinue = () => {
    dispatch({ type: 'transition', history: 'push', screen: AppScreens.TOTPEntry });
  };

  const handleCodeCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(displaySecret);
      toast.success(t({ id: 'mfa.totpEnrollment.toast.codeCopied', message: 'Code copied' }));
    } catch {
      toast.error(t({ id: 'mfa.totpEnrollment.toast.copyFailed', message: "Couldn't copy code to clipboard" }));
    }
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrow onClick={handleBack} />
      <Text size="header">
        {t({ id: 'mfa.totpEnrollment.title', message: 'Having trouble scanning the QR code?' })}
      </Text>
      <Text>
        {t({
          id: 'mfa.totpEnrollment.content',
          message: 'Click to copy the code below. Enter into your authenticator app to link your account.',
        })}
      </Text>
      <CodeContainer onClick={handleCodeCopy}>
        <Spacer />
        <Code>
          {secretChunked.map((part, i) => (
            <span key={i}>{part}</span>
          ))}
        </Code>
        <CopyButton
          type="button"
          onClick={handleCodeCopy}
          aria-label={t({ id: 'mfa.totpEnrollment.copyCode.ariaLabel', message: 'Copy code' })}
        >
          <Copy />
        </CopyButton>
      </CodeContainer>
      <Button type="button" onClick={handleContinue}>
        {t({ id: 'button.continue', message: 'Continue' })}
      </Button>
      <Button type="button" variant="text" onClick={handleBack}>
        {t({ id: 'button.totpQrRetry', message: 'Try to scan the QR code again' })}
      </Button>
    </Flex>
  );
};
