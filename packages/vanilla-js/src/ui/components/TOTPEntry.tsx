import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { OTPEntry } from './OTPEntry';

export interface TOTPEntryProps {
  isSubmitting: boolean;
  onSubmit: (otp: string) => void;
  errorMessage?: string;
  helperContent: React.ReactNode;
}

export const TOTPEntry = ({ helperContent, isSubmitting, onSubmit, errorMessage }: TOTPEntryProps) => {
  const { t } = useLingui();
  return (
    <OTPEntry
      header={t({ id: 'totp.title', message: 'Enter verification code' })}
      instruction={t({ id: 'totp.content', message: 'Enter the 6-digit code from your authenticator app.' })}
      helperContent={helperContent}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      errorMessage={errorMessage}
    />
  );
};
