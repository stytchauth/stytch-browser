import { useLingui } from '@lingui/react/macro';
import React, { CSSProperties, useMemo } from 'react';

import Button, { ButtonAnchor } from '../../components/atoms/Button';
import CodeContainer from '../../components/atoms/CodeContainer';
import Column from '../../components/atoms/Column';
import { errorToast } from '../../components/atoms/Toast';
import Typography from '../../components/atoms/Typography';
import VerticalTransition, { useTimedBoolean } from '../../components/atoms/VerticalTransition';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import TextColumn from '../../components/molecules/TextColumn';
import { useGlobalReducer } from '../GlobalContextProvider';
import styles from './RecoveryCodeSaveScreen.module.css';

export const RecoveryCodeSaveScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  // This screen should only be shown if TOTP enrollment is available
  const { recoveryCodes } = state.mfa.totp.enrollment!;

  const handleContinue = () => {
    dispatch({ type: 'recovery_code/save_acknowledge' });
  };

  const fileContent = useMemo(() => {
    const newline = navigator.platform === 'Win32' ? '\r\n' : '\n';
    const blob = new Blob([recoveryCodes.join(newline)], { type: 'text/plain' });
    return URL.createObjectURL(blob);
  }, [recoveryCodes]);

  const organizationName = state.flowState.organization?.organization_name;
  const filename = organizationName
    ? t({ id: 'recoveryCodes.filename.withOrganizationName', message: `${organizationName}-backup-codes` })
    : t({
        id: 'recoveryCodes.filename.noOrganizationName',
        message: 'backup-codes',
      });

  const [copied, setCopied] = useTimedBoolean(3);
  const handleCodesCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopied(true);
    } catch {
      errorToast({
        message: t({ id: 'recoveryCodes.save.toast.copyFailed', message: "Couldn't copy codes to clipboard" }),
      });
    }
  };

  const maxCodeLength = Math.max(...recoveryCodes.map((code) => code.length));

  return (
    <Column gap={6}>
      <TextColumn
        header={t({ id: 'recoveryCodes.save.title', message: 'Save your backup codes!' })}
        body={t({
          id: 'recoveryCodes.save.content',
          message: 'This is the only time you will be able to access and save your backup codes.',
        })}
      />

      <CodeContainer>
        <Typography font="mono">
          <ul className={styles.codes} style={{ '--st-max-code-length': maxCodeLength + 'ch' } as CSSProperties}>
            {recoveryCodes.map((code, i) => (
              <li key={i}>{code}</li>
            ))}
          </ul>
        </Typography>
      </CodeContainer>

      <ButtonColumn>
        {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
        <ButtonAnchor variant="primary" href={fileContent} download={filename + '.txt'}>
          <VerticalTransition
            primary={t({ id: 'recoveryCodes.save.button.download', message: 'Download .txt file' })}
            secondary={t({ id: 'recoveryCodes.save.button.copied', message: 'Copied!' })}
            triggered={copied}
          />
        </ButtonAnchor>
        <Button variant="outline" onClick={handleCodesCopy}>
          {t({ id: 'recoveryCodes.save.button.copyAll', message: 'Copy all to clipboard' })}
        </Button>
        <Button variant="ghost" onClick={handleContinue}>
          {t({ id: 'recoveryCodes.save.button.done', message: 'Done' })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
