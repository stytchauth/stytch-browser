import { SxProps, Theme } from '@mui/material';
import React from 'react';
import { SearchBarCore, SearchBarCoreProps } from '../shared/components/SearchBar';
import { Input } from './Input';

const iconContainerCommonSx = {
  zIndex: 1,
} as const;

const searchIconContainerSx: SxProps<Theme> = {
  ...iconContainerCommonSx,
  color: (theme) => theme.styleConfig.inputs.placeholderColor,
};

const slashIconContainerSx: SxProps<Theme> = { ...iconContainerCommonSx, bottom: 0, marginBottom: 0, height: '100%' };

const slashIconSx: SxProps<Theme> = {
  borderColor: (theme) => theme.styleConfig.colors.primary,
  color: (theme) => theme.styleConfig.inputs.placeholderColor,
  fontFamily: (theme) => theme.styleConfig.fontFamily,
  fontSize: (theme) => theme.typography.body2.fontSize,
  lineHeight: 1,
  padding: (theme) => theme.spacing(0.5, 1),
};

export const SearchBar = (props: SearchBarCoreProps): JSX.Element => {
  return (
    <SearchBarCore
      {...props}
      InputComponent={Input}
      searchIconContainerSx={searchIconContainerSx}
      slashIconSx={slashIconSx}
      slashIconContainerSx={slashIconContainerSx}
    />
  );
};
