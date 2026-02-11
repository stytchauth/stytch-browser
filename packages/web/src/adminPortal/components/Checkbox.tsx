import { checkboxClasses, styled, SxProps, Theme } from '@mui/material';
import React, { FC } from 'react';

import { CheckboxCore, CheckboxCoreProps } from '../shared/components/Checkbox';

export type CheckboxProps = CheckboxCoreProps;

const checkboxSx: SxProps<Theme> = {
  [`&, &.${checkboxClasses.checked}, &.${checkboxClasses.indeterminate}`]: {
    color: (theme) => theme.styleConfig.colors.primary,
  },
  [`&.${checkboxClasses.disabled}`]: {
    color: (theme) => theme.styleConfig.colors.secondary,
  },
};

const StyledCheckbox = styled(CheckboxCore)(({ theme }) => ({
  color: theme.styleConfig.colors.primary,
}));

export const Checkbox: FC<CheckboxProps> = (props): JSX.Element => {
  return <StyledCheckbox {...props} checkboxSx={checkboxSx} />;
};
