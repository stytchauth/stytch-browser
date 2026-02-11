import { useLingui } from '@lingui/react/macro';
import React, { CSSProperties, useLayoutEffect, useRef, useState } from 'react';

import Button from '../../components/atoms/Button';
import CodeContainer from '../../components/atoms/CodeContainer';
import Column from '../../components/atoms/Column';
import { errorToast } from '../../components/atoms/Toast';
import Typography from '../../components/atoms/Typography';
import VerticalTransition, { useTimedBoolean } from '../../components/atoms/VerticalTransition';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import TextColumn from '../../components/molecules/TextColumn';
import { useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import styles from './TOTPEnrollManualScreen.module.css';

const CHUNK_SIZE = 4;

export const TOTPEnrollManualScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  const [copied, setCopied] = useTimedBoolean(3);

  // This screen should only be shown if TOTP enrollment is available
  const { secret } = state.mfa.totp.enrollment!;

  const displaySecret = secret.toLowerCase();
  const secretChunked = displaySecret.split(new RegExp(`(.{${CHUNK_SIZE}})`, 'g')).filter(Boolean);

  const { codeRef, columnCount } = useColumnCount(secretChunked.length);

  const handleBack = () => dispatch({ type: 'navigate_back' });

  const handleContinue = () => {
    dispatch({ type: 'transition', history: 'push', screen: AppScreens.TOTPEntry });
  };

  const handleCodeCopy = async () => {
    try {
      await navigator.clipboard.writeText(displaySecret);
      setCopied(true);
    } catch {
      errorToast({
        message: t({ id: 'mfa.totpEnrollment.toast.copyFailed', message: "Couldn't copy code to clipboard" }),
      });

      // Select all text instead as fallback
      const selection = window.getSelection();
      if (codeRef.current && selection) {
        selection.empty();
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        selection.addRange(range);
      }
    }
  };

  return (
    <Column gap={6}>
      <TextColumn
        header={t({ id: 'mfa.totpEnrollment.title', message: 'Having trouble scanning the QR code?' })}
        body={t({
          id: 'mfa.totpEnrollment.content',
          message: 'Click to copy the code below. Enter into your authenticator app to link your account.',
        })}
      />

      {/* No additional keyboard support since there's a copy code button below */}
      <CodeContainer className={styles.codeContainer} onClick={handleCodeCopy}>
        {/* This Typography element is on the outside because we need the 1ch gap to also be in monospace */}
        <Typography
          ref={codeRef}
          className={styles.code}
          style={
            {
              '--st-column-count': columnCount,
              '--st-chunk-size': CHUNK_SIZE + 'ch',
            } as CSSProperties
          }
          font="mono"
        >
          {secretChunked.map((part, i) => (
            <span key={i}>{part}</span>
          ))}
        </Typography>
      </CodeContainer>

      <ButtonColumn>
        <Button variant="primary" onClick={handleCodeCopy}>
          <VerticalTransition
            primary={t({ id: 'mfa.totpEnrollment.copyCode.label', message: 'Copy to clipboard' })}
            secondary={t({ id: 'mfa.totpEnrollment.copyCode.codeCopied', message: 'Copied!' })}
            triggered={copied}
          />
        </Button>
        <Button variant="outline" onClick={handleContinue}>
          {t({ id: 'button.continue', message: 'Continue' })}
        </Button>
        <Button variant="ghost" onClick={handleBack}>
          {t({ id: 'button.totpQrRetry', message: 'Try to scan the QR code again' })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};

// Balance out the rows - this is fairly complex, but there's not any way to really do this in CSS only
// so instead we read the width of the container and the chunks below it, then use that to calculate
// first the number of rows, then how many chunks can evenly fit per row
function useColumnCount(chunksCount: number) {
  const codeRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState<number>();

  useLayoutEffect(() => {
    const updateRowCount = () => {
      if (!codeRef.current) return;

      // Get the width of the container and inner spans
      const containerWidth = codeRef.current.clientWidth;
      const spanWidth = Math.max(
        ...Array.from(codeRef.current.querySelectorAll('span')).map((elem) => elem.clientWidth),
      );

      // Find the number of columns to display. First compute the raw number
      // Note we don't check how many rows are currently rendered because this number is already affected by
      // the current row count.
      const fittedColumns = Math.floor(containerWidth / spanWidth);
      // Then account for gaps (1ch each, so 1/CHUNK_SIZE per gap)
      const fittedColumnsWithGaps = fittedColumns - Math.floor(fittedColumns / CHUNK_SIZE);
      // Number of rows is count / columns
      const rows = Math.ceil(chunksCount / fittedColumnsWithGaps);
      // And finally the closest even column count is count / rows
      const evenColumns = Math.ceil(chunksCount / rows);

      setColumnCount(evenColumns);
    };

    updateRowCount();

    if (!window.ResizeObserver || !codeRef.current) return;
    const observer = new ResizeObserver(updateRowCount);
    observer.observe(codeRef.current);
    return () => observer.disconnect();
  }, [chunksCount]);

  return {
    codeRef,
    columnCount,
  };
}
