import React, { FC } from 'react';

import { SxProps, Theme } from '@mui/material';
import { ToastContextProviderCore, ToastContextProviderCoreProps } from '../shared/components/Toast';
import { Typography } from './Typography';

export { useToast } from '../shared/components/Toast';

export type ToastContextProviderProps = ToastContextProviderCoreProps;

const alertSx: SxProps<Theme> = {
  backgroundColor: (theme) => theme.styleConfig.container.backgroundColor,
  boxShadow: '0px 5px 10px 0px rgba(0, 0, 0, 0.20)',
  border: '1px solid',
  borderColor: (theme) => theme.styleConfig.container.borderColor,
  borderRadius: (theme) => theme.styleConfig.borderRadius,
};

const closeIconSx: SxProps<Theme> = { color: (theme) => theme.styleConfig.colors.error };
const errorSx: SxProps<Theme> = { '&, & p': { color: (theme) => theme.styleConfig.colors.error } };
const errorIconSx = errorSx;
const successSx: SxProps<Theme> = { '&, & p': { color: (theme) => theme.styleConfig.colors.success } };
const successIconSx = successSx;

export const ToastContextProvider: FC<ToastContextProviderProps> = (props) => {
  return (
    <ToastContextProviderCore
      TypographyComponent={Typography}
      {...props}
      alertSx={alertSx}
      closeIconSx={closeIconSx}
      errorIconSx={errorIconSx}
      errorSx={errorSx}
      successIconSx={successIconSx}
      successSx={successSx}
    />
  );
};
