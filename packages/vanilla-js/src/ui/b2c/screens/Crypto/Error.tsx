import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import { useGlobalReducer, AppScreens } from '../../GlobalContextProvider';
import BackArrowIcon from '../../../../assets/backArrow';

export const Error = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();

  return (
    <Flex direction="column" gap={24}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">{t({ id: 'crypto.error.title', message: 'Looks like there was an error!' })}</Text>
      <Text>
        {t({
          id: 'crypto.error.content',
          message:
            'Your sign in request could not be completed. Use the back arrow to return to the log in screen and try again!',
        })}
      </Text>
    </Flex>
  );
};
