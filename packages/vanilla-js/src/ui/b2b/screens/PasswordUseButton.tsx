import React from 'react';
import { useGlobalReducer } from '../GlobalContextProvider';
import { useLingui } from '@lingui/react/macro';
import { HelpButton } from '../../components/HelpButton';

export const PasswordUseButton = ({ email }: { email: string }) => {
  const [, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  const handleUsePassword = () => {
    dispatch({ type: 'use_password_auth', email });
  };

  return (
    <HelpButton themeColor="primary" onClick={handleUsePassword}>
      {t({ id: 'button.usePassword', message: 'Use a password instead' })}
    </HelpButton>
  );
};
