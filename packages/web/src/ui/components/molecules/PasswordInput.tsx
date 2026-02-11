import { useLingui } from '@lingui/react/macro';
import React, { useEffect, useRef, useState } from 'react';

import { InputLabelProps } from '../../../utils/accessibility';
import Button from '../atoms/Button';
import Input from './Input';

export type PasswordInputProps = InputLabelProps & {
  password: string;
  setPassword: (email: string) => void;
  type: 'new' | 'current';

  // Passed through
  hideLabel?: boolean;
  error?: string;
  minLength?: number;
  passwordrules?: string;
};

export const PasswordInput = ({ password, setPassword, type, ...additionalProps }: PasswordInputProps) => {
  const { t } = useLingui();
  const [visible, setVisible] = useState(false);

  // https://technology.blog.gov.uk/2021/04/19/simple-things-are-complicated-making-a-show-password-option/
  // Recommends setting the type back to password on submit
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;

    const controller = new AbortController();
    form.addEventListener(
      'submit',
      () => {
        // Don't know if this is fast enough, so we also update the DOM directly
        if (inputRef.current) inputRef.current.type = 'password';
        setVisible(false);
      },
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, []);

  return (
    <Input
      id={`${type}-password`}
      label={t({ id: 'formField.password.label', message: 'Password' })}
      ref={inputRef}
      autoComplete={`${type}-password`}
      type={visible ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      action={
        <Button variant="ghost" onClick={() => setVisible(!visible)}>
          {visible
            ? t({ id: 'button.hidePassword', message: 'Hide' })
            : t({ id: 'button.showPassword', message: 'Show' })}
        </Button>
      }
      {...additionalProps}
    />
  );
};
