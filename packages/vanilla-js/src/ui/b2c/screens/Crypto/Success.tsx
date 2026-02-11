import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Flex } from '../../../components/Flex';
import { AppScreens, useGlobalReducer } from '../../GlobalContextProvider';
import BackArrowIcon from '../../../../assets/backArrow';
import { Confirmation } from '../../../components/Confirmation';

export const Success = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Confirmation
        header={t({ id: 'crypto.success.title', message: 'Success!' })}
        text={t({ id: 'crypto.success.content', message: 'You have successfully connected your wallet.' })}
      />
    </Flex>
  );
};
