import React from 'react';
import { LoadingButton } from './LoadingButton';

export type SubmitButtonProps = {
  isSubmitting: boolean;
  disabled?: boolean;
  text: string;
  variant?: 'primary' | 'outlined' | 'text';
};

export const SubmitButton = ({ isSubmitting, disabled, text, variant }: SubmitButtonProps) => {
  const buttonDisabled = isSubmitting || disabled;

  return (
    <LoadingButton isLoading={isSubmitting} type="submit" disabled={buttonDisabled} variant={variant}>
      {text}
    </LoadingButton>
  );
};
