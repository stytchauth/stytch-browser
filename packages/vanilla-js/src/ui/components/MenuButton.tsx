import React from 'react';
import styled from 'styled-components';
import Chevron from '../../assets/chevron';
import { BaseButton } from './BaseButton';

const StyledButton = styled(BaseButton)`
  color: ${(props) => props.theme.colors.primary};
  padding: 20px 0;
  border-bottom: 1px solid #e5e8eb;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MenuText = styled.div`
  flex: 1 1 auto;
`;

const ChevronContainer = styled.span`
  flex: 0 0 auto;
`;

export const MenuButton = ({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) => {
  return (
    <StyledButton type="button" onClick={onClick} disabled={disabled}>
      <MenuText>{children}</MenuText>
      <ChevronContainer aria-hidden>
        <Chevron />
      </ChevronContainer>
    </StyledButton>
  );
};
