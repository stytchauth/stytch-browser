import { useLingui } from '@lingui/react/macro';
import React from 'react';

import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import { Confirmation } from '../../../components/molecules/Confirmation';
import { AppScreens, useGlobalReducer } from '../../GlobalContextProvider';

export const Success = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();

  return (
    <Column gap={6}>
      <Confirmation
        header={t({ id: 'crypto.success.title', message: 'Success!' })}
        text={t({ id: 'crypto.success.content', message: 'You have successfully connected your wallet.' })}
      />
      <Button variant="outline" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
        {t({ id: 'button.goBack', message: 'Go back' })}
      </Button>
    </Column>
  );
};
