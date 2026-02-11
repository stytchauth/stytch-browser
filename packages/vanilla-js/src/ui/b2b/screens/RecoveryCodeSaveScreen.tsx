import React from 'react';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import Button from '../../components/Button';
import { Flex } from '../../components/Flex';
import { InsetContainer } from '../../components/InsetContainer';
import { Text } from '../../components/Text';
import { useGlobalReducer } from '../GlobalContextProvider';
import { useLingui } from '@lingui/react/macro';

const CodeList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const RecoveryCodeSaveScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  // This screen should only be shown if TOTP enrollment is available
  const { recoveryCodes } = state.mfa.totp.enrollment!;

  const handleContinue = () => {
    dispatch({ type: 'recovery_code/save_acknowledge' });
  };

  const handleCodesDownload = () => {
    const organizationName = state.flowState.organization?.organization_name;

    downloadFile(recoveryCodes.join('\n'), `${organizationName ? organizationName + '-' : ''}backup-codes.txt`);
  };

  const handleCodesCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      toast.success(t({ id: 'recoveryCodes.save.toast.copied', message: 'Copied' }));
    } catch {
      toast.error(t({ id: 'recoveryCodes.save.toast.copyFailed', message: "Couldn't copy codes to clipboard" }));
    }
  };

  return (
    <Flex direction="column" gap={24}>
      <Text size="header">{t({ id: 'recoveryCodes.save.title', message: 'Save your backup codes!' })}</Text>
      <Text>
        {t({
          id: 'recoveryCodes.save.content',
          message: 'This is the only time you will be able to access and save your backup codes.',
        })}
      </Text>
      <InsetContainer>
        <CodeList>
          {recoveryCodes.map((code, i) => (
            <li key={i}>
              <code>{code}</code>
            </li>
          ))}
        </CodeList>
      </InsetContainer>
      <Flex gap={24}>
        <Button type="button" onClick={handleCodesDownload}>
          {t({ id: 'recoveryCodes.save.button.download', message: 'Download file' })}
        </Button>
        <Button type="button" onClick={handleCodesCopy}>
          {t({ id: 'recoveryCodes.save.button.copyAll', message: 'Copy all' })}
        </Button>
      </Flex>
      <Button type="button" variant="text" onClick={handleContinue}>
        {t({ id: 'recoveryCodes.save.button.done', message: 'Done' })}
      </Button>
    </Flex>
  );
};
