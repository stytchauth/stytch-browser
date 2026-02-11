import { useLingui } from '@lingui/react/macro';
import React from 'react';
import styled from 'styled-components';
import { Flex } from './Flex';
import { Text } from './Text';

const DividerContainer = styled(Flex)`
  color: ${(props) => props.theme.colors.secondary};
`;

const DividerBar = styled.div<{ $placement: 'left' | 'right' }>`
  ${(props) => props.$placement === 'left' && 'margin-right: 6px;'}
  ${(props) => props.$placement === 'right' && 'margin-left: 6px;'}
  border-bottom: 1px solid ${(props) => props.theme.colors.secondary};
  flex-grow: 1;
`;

const StyledText = styled(Text)`
  color: ${(props) => props.theme.colors.secondary};
`;

export const Divider = () => {
  const { t } = useLingui();

  return (
    <DividerContainer alignItems="center">
      <DividerBar $placement="left" />
      <StyledText>{t({ id: 'methodDivider.text', message: 'or' })}</StyledText>
      <DividerBar $placement="right" />
    </DividerContainer>
  );
};
