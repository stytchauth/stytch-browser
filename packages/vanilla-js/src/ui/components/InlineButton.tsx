import React from 'react';
import styled from 'styled-components';
import { BaseButton } from './BaseButton';

interface InlineButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const StyledButton = styled(BaseButton)<InlineButtonProps>`
  font-weight: bold;

  &:focus-visible,
  &:hover {
    outline: none;
    text-decoration: underline;
    text-decoration-color: ${(props) => props.theme.colors.primary};
  }

  &:disabled {
    pointer-events: none;
  }
`;

export const InlineButton = ({ onClick, children, disabled, className }: InlineButtonProps) => (
  <StyledButton onClick={onClick} disabled={disabled} className={className}>
    {children}
  </StyledButton>
);
