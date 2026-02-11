import { useLingui } from '@lingui/react/macro';
import React, { ReactNode } from 'react';

import AnimatedContainer from '../atoms/AnimatedContainer';
import { chromaticIgnoreClassName } from '../atoms/chromaticIgnoreClassName';
import Column from '../atoms/Column';
import LoadingBar from '../atoms/LoadingBar';
import Typography from '../atoms/Typography';
import ErrorText from './ErrorText';
import styles from './OTPEntry.module.css';
import OtpInput from './OtpInput';
import TextColumn from './TextColumn';

interface OTPEntryProps {
  header: ReactNode;
  instruction: ReactNode;
  helperContent: ReactNode;
  isSubmitting: boolean;
  onSubmit: (otp: string) => void;
  errorMessage?: string;
}

const OTPEntry = ({ header, helperContent, instruction, isSubmitting, onSubmit, errorMessage }: OTPEntryProps) => {
  const { t } = useLingui();

  return (
    <Column gap={6}>
      <TextColumn header={header} body={instruction} />

      <Column gap={2}>
        {/* HACK: We can't have gap: 2 between OtpInput and the loading component below,
         * so instead we add padding-top: spacing-2 to progressContainer, hence the
         * slightly concerning number of nested Columns */}
        <Column>
          <OtpInput onSubmit={onSubmit} disabled={isSubmitting} />

          <AnimatedContainer isOpen={isSubmitting}>
            <Column className={styles.progressInner} gap={2}>
              <Typography variant="helper">
                {t({ id: 'formField.passcode.status.verifying', message: 'Verifying passcode...' })}
              </Typography>

              <LoadingBar isLoading={isSubmitting} />
            </Column>
          </AnimatedContainer>
        </Column>

        <Column>
          {!isSubmitting && errorMessage && <ErrorText>{errorMessage}</ErrorText>}
          <Typography variant="helper" className={chromaticIgnoreClassName()}>
            {helperContent}
          </Typography>
        </Column>
      </Column>
    </Column>
  );
};

export default OTPEntry;
