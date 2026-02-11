import * as React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Flex } from './Flex';
import { Text } from './Text';
import { CircularProgress } from './CircularProgress';

export const LoggingInScreen = () => {
  const { t } = useLingui();
  return (
    <Flex direction="column" gap={36} alignItems="center">
      <Text size="header">{t({ id: 'login.loading', message: 'Logging in...' })}</Text>
      <CircularProgress size={100} thickness={8} />
    </Flex>
  );
};

export const LoadingScreen = () => (
  <Flex direction="column" gap={36} alignItems="center">
    <CircularProgress size={100} thickness={8} />
  </Flex>
);
