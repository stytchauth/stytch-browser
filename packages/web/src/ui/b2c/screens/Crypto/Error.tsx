import { useLingui } from '@lingui/react/macro';
import React from 'react';

import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import TextColumn from '../../../components/molecules/TextColumn';
import { AppScreens, useGlobalReducer } from '../../GlobalContextProvider';

export const Error = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();

  return (
    <Column gap={6}>
      <TextColumn
        header={t({ id: 'crypto.error.title', message: 'Looks like there was an error' })}
        body={t({
          id: 'crypto.error.content',
          message: 'Your sign in request could not be completed. Go back to the main screen and try logging in again.',
        })}
      />
      <Button variant="outline" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
        {t({ id: 'button.goBack', message: 'Go back' })}
      </Button>
    </Column>
  );
};
