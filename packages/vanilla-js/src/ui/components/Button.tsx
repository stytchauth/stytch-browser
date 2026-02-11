import styled from 'styled-components';
import { BaseButton } from './BaseButton';

type ButtonProps = {
  variant?: 'primary' | 'outlined' | 'text';
};

const Button = styled(BaseButton)<ButtonProps>`
  width: 100%;
  height: 45px;
  font-size: 18px;
  text-transform: none;
  box-shadow: none;
  text-align: center;

  ${(props) => {
    switch (props.variant) {
      case 'primary':
        return `
          border: ${props.theme.buttons.primary.border};
          border-radius: ${props.theme.buttons.primary.borderRadius};
          color: ${props.theme.buttons.primary.textColor};
          background-color: ${props.theme.buttons.primary.backgroundColor};
        `;
      case 'outlined':
        return `
          border: ${props.theme.buttons.secondary.border};
          border-radius: ${props.theme.buttons.secondary.borderRadius};
          color: ${props.theme.buttons.secondary.textColor};
          background-color: ${props.theme.buttons.secondary.backgroundColor};
        `;
      case 'text':
        return `
          color: ${props.theme.colors.primary};
          background-color: transparent;
          font-weight: 600;
        `;
    }
  }}

  &:disabled {
    background-color: ${(props) => props.theme.buttons.disabled.backgroundColor};
    color: ${(props) => props.theme.buttons.disabled.textColor};
    border: ${(props) => props.theme.buttons.disabled.border};
    border-radius: ${(props) => props.theme.buttons.disabled.borderRadius};
  }
`;

Button.defaultProps = {
  variant: 'primary',
};

export default Button;
