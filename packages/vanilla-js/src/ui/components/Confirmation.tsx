import * as React from 'react';
import { useLingui } from '@lingui/react/macro';
import { ConfirmationSVG } from '../../assets/confirmation';
import { Flex } from './Flex';
import { Text } from './Text';

type ConfirmationProps = {
  header?: string;
  text?: string;
};
export const Confirmation = ({ header, text }: ConfirmationProps) => {
  const { t } = useLingui();
  const defaultHeader = t({ id: 'success.title', message: 'Success!' });
  const defaultText = t({ id: 'login.success.content', message: 'You have successfully logged in.' });

  return (
    <Flex direction="column" gap={24} alignItems="center">
      <Text size="header">{header ?? defaultHeader}</Text>
      <Text>{text ?? defaultText}</Text>
      <ConfirmationSVG />
    </Flex>
  );
};
