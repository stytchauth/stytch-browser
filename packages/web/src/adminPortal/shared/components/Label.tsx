import { styled } from '@mui/material';
import React, { FC, ReactNode } from 'react';

import { InjectedComponents } from './componentInjection';

const StyledLabelContainer = styled('span')(() => ({
  display: 'flex',
  alignItems: 'center',
}));

export type LabelCoreProps = {
  children: ReactNode;
  disabled?: boolean;
  htmlFor?: string;
  required?: boolean;
  variant?: 'body1' | 'body2' | 'caption';
  labelColor?: 'secondary';
};

export const LabelCore: FC<LabelCoreProps & InjectedComponents<'Typography'>> = ({
  children,
  disabled,
  htmlFor,
  required,
  variant = 'body2',
  TypographyComponent: Typography,
  labelColor,
}) => {
  return (
    <StyledLabelContainer>
      <label aria-required={required} htmlFor={htmlFor}>
        <Typography color={labelColor} disabled={disabled} variant={variant}>
          {children}
        </Typography>
      </label>
      {required && (
        <Typography color="error" disabled={disabled} variant="body2">
          *
        </Typography>
      )}
    </StyledLabelContainer>
  );
};
