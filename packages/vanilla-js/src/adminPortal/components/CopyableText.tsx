import { SxProps, Theme } from '@mui/material';
import React from 'react';
import { CopyableTextCore, CopyableTextCoreProps } from '../shared/components/CopyableText';
import { useClickToCopy } from '../utils/clickToCopyUtils';
import { Code } from './Code';
import { Label } from './Label';
import { Typography } from './Typography';

export interface CopyableTextProps extends CopyableTextCoreProps {
  whiteSpace?: 'pre-wrap' | undefined;
}

const wrapperSx: SxProps<Theme> = (theme) => ({
  backgroundColor: theme.styleConfig.colors.accent,
});

export const CopyableText = (props: CopyableTextProps): JSX.Element => {
  return (
    <CopyableTextCore
      {...props}
      CodeComponent={Code}
      LabelComponent={Label}
      TypographyComponent={Typography}
      useClickToCopy={useClickToCopy}
      wrapperSx={wrapperSx}
    />
  );
};
