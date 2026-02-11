import { SxProps, Theme } from '@mui/material';
import React from 'react';

import { SelectCore, SelectCoreProps } from '../shared/components/Select';
import { Label, LabelProps } from './Label';
import { MenuItem, MenuItemFields } from './MenuItem';
import { Typography } from './Typography';

export type SelectItem = MenuItemFields;

export type SelectProps<U extends string | number | string[] | number[]> = SelectCoreProps<U, SelectItem> & {
  width?: number;
  labelColor?: LabelProps['labelColor'];
};

const LabelSecondary = (props: LabelProps) => {
  return <Label labelColor="secondary" {...props} />;
};

const checkIconSx: SxProps<Theme> = { color: (theme) => theme.styleConfig.colors.primary };
const selectSx: SxProps<Theme> = { color: (theme) => theme.styleConfig.colors.primary };

export const Select = <U extends string | number | string[] | number[]>(props: SelectProps<U>): JSX.Element => {
  return (
    <SelectCore
      {...props}
      LabelComponent={props.labelColor === 'secondary' ? LabelSecondary : Label}
      MenuItemComponent={MenuItem}
      TypographyComponent={Typography}
      checkIconSx={checkIconSx}
      selectSx={selectSx}
    />
  );
};
