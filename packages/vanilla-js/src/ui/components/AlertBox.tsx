import React from 'react';
import styled from 'styled-components';
import { Flex } from './Flex';
import { Text } from './Text';
import { IconColorOverride } from './IconColorOverride';
import WarningIcon from '../../assets/warningIcon';
import SuccessIcon from '../../assets/successIcon';
import ErrorIcon from '../../assets/errorIcon';

type VariantType = 'warning' | 'success' | 'error';

const AlertBoxStyled = styled(Flex)<{
  variant: VariantType;
}>`
  border: 1px solid ${(props) => props.theme.colors[props.variant]};
  border-left-width: 6px;
  border-radius: 4px;
  padding: 24px;
`;

type AlertBoxProps = {
  variant: VariantType;
  text: string;
};

/**
 * Figma reference: https://www.figma.com/design/KiiirGLnDf2AZSCPGMpLrp/-Q3-2023--KL--Updated-10-20--Passkeys-in-the-SDK?node-id=3325-9771&t=nLvpAZGSOihQCor2-4
 * with tweaks
 */
export const AlertBox = ({ variant, text }: AlertBoxProps) => {
  return (
    <AlertBoxStyled variant={variant} gap={8} alignItems="center">
      <IconColorOverride themeColor={variant}>
        {variant === 'error' && <ErrorIcon />}
        {variant === 'warning' && <WarningIcon />}
        {variant === 'success' && <SuccessIcon />}
      </IconColorOverride>

      <Text size="helper" color="primary">
        {text}
      </Text>
    </AlertBoxStyled>
  );
};
