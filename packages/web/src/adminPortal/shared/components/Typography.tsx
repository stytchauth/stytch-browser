import { styled, Typography as MUITypography, TypographyProps as MUITypographyProps } from '@mui/material';
import React, { FC, ReactNode } from 'react';

const StyledTypography = styled(MUITypography)(({ theme }) => ({
  '& ul': {
    margin: theme.spacing(1, 0, 0),
  },
})) as typeof MUITypography;

type Color = 'primary' | 'secondary' | 'error';
const colorToMUIColor: Record<Color, MUITypographyProps['color']> = {
  primary: 'primary',
  secondary: 'textSecondary',
  error: 'error',
};

export type TypographyCoreProps = {
  align?: MUITypographyProps['align'];
  children?: ReactNode;
  color?: Color;
  component?: React.ElementType;
  disabled?: boolean;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body1' | 'body2' | 'caption';
};

export const TypographyCore: FC<TypographyCoreProps> = ({
  align,
  children,
  color,
  component,
  disabled,
  variant = 'body1',
}) => {
  return (
    <StyledTypography
      align={align}
      color={color ? colorToMUIColor[color] : disabled ? 'textSecondary' : undefined}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- typing is complicated
      component={component as any}
      variant={variant}
    >
      {children}
    </StyledTypography>
  );
};
