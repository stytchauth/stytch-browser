import React, { FC } from 'react';
import { CheckboxCoreProps, CheckboxCore } from '../shared/components/Checkbox';
import { SxProps, Theme, checkboxClasses, styled } from '@mui/material';

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
