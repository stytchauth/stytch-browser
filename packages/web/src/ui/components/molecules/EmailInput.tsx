import { useLingui } from '@lingui/react/macro';
import React from 'react';

import { passwordManagerDisableAutofillProps } from '../../../utils/passwordManagerDisableAutofillProps';
import Input from './Input';

const EmailInput = ({
  email,
  setEmail,
  hasPasskeys = false,
  ...additionalProps
}: {
  email: string;
  setEmail: (email: string) => void;
  hasPasskeys?: boolean;

  // Passed through
  hideLabel?: boolean;
  disabled?: boolean;
  error?: string;
}) => {
  const { t } = useLingui();
  return (
    <Input
      id="email-input"
      label={t({ id: 'formField.email.label', message: 'Email' })}
      placeholder={t({ id: 'formField.email.placeholder', message: 'example@email.com' })}
      type="email"
      autoComplete={hasPasskeys ? 'username webauthn' : 'email'}
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

export default EmailInput;
