import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { passwordManagerDisableAutofillProps } from '../../utils/passwordManagerDisableAutofillProps';
import { Input } from './Input';
import { InputLabelProps } from '../../utils/accessibility';

export const EmailInput = ({
  email,
  setEmail,
  disableInput = false,
  hasPasskeys = false,
  ...additionalProps
}: {
  email: string;
  setEmail: (email: string) => void;
  disableInput?: boolean;
  hasPasskeys?: boolean;
} & InputLabelProps) => {
  const { t } = useLingui();

  return (
    <Input
      placeholder={t({ id: 'formField.email.placeholder', message: 'example@email.com' })}
      name="email"
      type="email"
      autoComplete={hasPasskeys ? 'username webauthn' : 'email'}
      disabled={disableInput}
      id="email-input"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      // We want to block 1PW's autofill when passkeys is enabled for now
      // (it is breaking to our integration)
      {...(hasPasskeys ? passwordManagerDisableAutofillProps : {})}
      {...additionalProps}
    />
  );
};
