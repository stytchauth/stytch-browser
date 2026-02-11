import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Button from '../../components/Button';
import { Flex } from '../../components/Flex';

const ButtonInnerContainer = styled(Flex)`
  margin: 8px;
`;

const StyledButton = styled(Button)`
  height: auto;
  min-height: 45px;
`;

export interface AuthButtonProps {
  icon?: ReactNode;
  children: ReactNode;

  // Passthrough button props
  id?: string;
  onClick: () => void;
  disabled?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ children, icon, ...buttonProps }) => (
  <StyledButton type="button" variant="outlined" {...buttonProps}>
    <ButtonInnerContainer justifyContent="center" alignItems="center" gap={4}>
      {icon}
      <span style={{ verticalAlign: 'middle' }}>{children}</span>
    </ButtonInnerContainer>
  </StyledButton>
);
