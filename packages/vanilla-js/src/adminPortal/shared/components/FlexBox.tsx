import { useTheme } from '@mui/material';
import React, { FC, ReactNode } from 'react';

import { DEFAULT_GAP } from '../components/constants';

type Props = {
  gap?: number; // 8px scaling factor. For example, gap={3} means 24px of gap spacing. Defaults to DEFAULT_GAP.
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  children: ReactNode;
};

// Row container that will wrap according to width of the container
export const FlexBox: FC<Props> = ({ children, gap, alignItems, flexDirection, justifyContent, flexWrap }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        gap: theme.spacing(gap ?? DEFAULT_GAP),
        alignItems,
        justifyContent,
        flexDirection,
        flexWrap,
      }}
    >
      {children}
    </div>
  );
};
