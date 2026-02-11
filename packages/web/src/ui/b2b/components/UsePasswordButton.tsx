import { useLingui } from '@lingui/react/macro';
import React from 'react';

import Button from '../../components/atoms/Button';
import { useGlobalReducer } from '../GlobalContextProvider';

const UsePasswordButton = ({ email }: { email: string }) => {
  const [, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  const handleUsePassword = () => {
    dispatch({ type: 'use_password_auth', email });
  };

  return (
    <Button variant="ghost" onClick={handleUsePassword}>
      {t({ id: 'button.usePassword', message: 'Use a password instead' })}
    </Button>
  );
};

export default UsePasswordButton;
