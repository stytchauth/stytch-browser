import {
  Button as MUIButton,
  buttonClasses,
  ButtonProps as InternalButtonProps,
  ButtonProps as MUIButtonProps,
  styled,
} from '@mui/material';
import React, { FC, MouseEventHandler, ReactNode } from 'react';

export type Variant = 'ghost' | 'primary' | 'text';

const variantToMUIVariant: Record<Variant, MUIButtonProps['variant']> = {
  ghost: 'outlined',
  primary: 'contained',
  text: 'text',
};

const StyledButton = styled(MUIButton)<{
  isCompact?: boolean;
  iconOnly: boolean;
}>(({ theme, isCompact, iconOnly }) => [
  {
    borderRadius: 3,
    boxShadow: 'none',
    fontSize: theme.typography.body1.fontSize,
    minHeight: 40,
    whiteSpace: 'nowrap',
    width: 'fit-content',
    [`&.${buttonClasses.fullWidth}`]: {
      width: '100%',
    },
    '&, &:active, &:hover': {
      boxShadow: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      whiteSpace: 'unset',
      minHeight: 'fit-content',
    },
  },
  isCompact && {
    [`& .${buttonClasses.startIcon}`]: {
      marginRight: theme.spacing(0.5),
    },
    [`& .${buttonClasses.endIcon}`]: {
      marginLeft: theme.spacing(0.5),
    },
    fontSize: theme.typography.body1.fontSize,
    minHeight: 30,
    padding: '0 10px',
    minWidth: 'fit-content',
  },
  iconOnly && {
    [`& .${buttonClasses.startIcon}, & .${buttonClasses.endIcon}`]: {
      margin: 0,
    },
  },
]);

export type ButtonCoreProps = {
  autoFocus?: boolean;
  children?: ReactNode;
  compact?: boolean;
  component?: 'span' | 'button' | 'div' | 'label';
  disabled?: boolean;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  startIcon?: ReactNode;
  type?: InternalButtonProps['type'];
  variant?: Variant;
  warning?: boolean;

  /**
   * Should not be used directly! This is required for styled(Button) to work.
   */
  className?: string;
};

export const ButtonCore: FC<ButtonCoreProps> = ({ children, compact, variant, ...props }): JSX.Element => {
  const buttonVariant = variant ?? 'primary';
  return (
    <StyledButton {...props} iconOnly={!children} isCompact={compact} variant={variantToMUIVariant[buttonVariant]}>
      {children}
    </StyledButton>
  );
};
