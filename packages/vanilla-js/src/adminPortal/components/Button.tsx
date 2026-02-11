import { styled } from '@mui/material';
import React, { FC } from 'react';
import { ButtonCore, ButtonCoreProps, Variant } from '../shared/components/Button';

const mixed = (color: string) => `color-mix(in srgb, ${color} 80%, #333)`;

const StyledButton = styled(ButtonCore)<{
  variant?: Variant;
  warning?: boolean;
}>(
  ({ theme }) => ({
    '&:disabled': {
      backgroundColor: theme.styleConfig.buttons.disabled.backgroundColor,
      borderColor: theme.styleConfig.buttons.disabled.borderColor,
      color: theme.styleConfig.buttons.disabled.textColor,
    },
    fontSize: 12,
    minHeight: 32,
    borderRadius: theme.styleConfig.borderRadius,
    fontWeight: 700,
    borderWidth: 1,
    borderStyle: 'solid',
  }),
  ({ theme, variant, warning }) => {
    if (warning) {
      switch (variant) {
        case 'ghost':
          return {
            '&:hover': {
              backgroundColor: mixed(theme.styleConfig.buttons.secondary.backgroundColor),
              borderColor: theme.styleConfig.colors.error,
              color: theme.styleConfig.colors.error,
            },
            backgroundColor: theme.styleConfig.buttons.secondary.backgroundColor,
            borderColor: theme.styleConfig.colors.error,
            color: theme.styleConfig.colors.error,
          };
        case 'primary':
          return {
            '&:hover': {
              backgroundColor: mixed(theme.styleConfig.colors.error),
              color: theme.styleConfig.buttons.primary.textColor,
            },
            backgroundColor: theme.styleConfig.colors.error,
            color: theme.styleConfig.buttons.primary.textColor,
          };
        case 'text':
          return {
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: theme.styleConfig.colors.error,
            },
            backgroundColor: 'transparent',
            color: theme.styleConfig.colors.error,
            borderWidth: 0,
          };
        default:
          return {
            '&:hover': {
              backgroundColor: mixed(theme.styleConfig.colors.error),
              color: theme.styleConfig.buttons.primary.textColor,
            },
            backgroundColor: theme.styleConfig.colors.error,
            color: theme.styleConfig.colors.error,
          };
      }
    }
    switch (variant) {
      case 'ghost':
        return {
          '&:hover': {
            backgroundColor: mixed(theme.styleConfig.buttons.secondary.backgroundColor),
          },
          backgroundColor: theme.styleConfig.buttons.secondary.backgroundColor,
          color: theme.styleConfig.buttons.secondary.textColor,
          borderRadius: theme.styleConfig.buttons.secondary.borderRadius,
          borderColor: theme.styleConfig.buttons.secondary.borderColor,
        };
      case 'primary':
        return {
          '&:hover': {
            backgroundColor: mixed(theme.styleConfig.buttons.primary.backgroundColor),
          },
          backgroundColor: theme.styleConfig.buttons.primary.backgroundColor,
          color: theme.styleConfig.buttons.primary.textColor,
          borderRadius: theme.styleConfig.buttons.primary.borderRadius,
          borderColor: theme.styleConfig.buttons.primary.borderColor,
        };
      case 'text':
        return {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
          backgroundColor: 'transparent',
          color: theme.styleConfig.colors.primary,
          borderWidth: 0,
        };
      default:
        return {
          '&:hover': {
            backgroundColor: mixed(theme.styleConfig.buttons.primary.backgroundColor),
          },
          backgroundColor: theme.styleConfig.buttons.primary.backgroundColor,
          color: theme.styleConfig.buttons.primary.textColor,
          borderRadius: theme.styleConfig.buttons.primary.borderRadius,
          borderColor: theme.styleConfig.buttons.primary.borderColor,
        };
    }
  },
);

export type ButtonProps = ButtonCoreProps & {
  component?: 'span' | 'button' | 'div' | 'label';
};

export const Button: FC<ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ ...props }): JSX.Element => {
  return <StyledButton compact {...props} />;
};
