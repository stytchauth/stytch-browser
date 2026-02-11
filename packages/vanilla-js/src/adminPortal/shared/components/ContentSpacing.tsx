import { useTheme } from '@mui/material';
import React, { FC, ReactNode } from 'react';

import { DEFAULT_GAP } from './constants';

export type ContentSpacingCoreProps = {
  gap?: number; // 8px scaling factor. For example, gap={3} means 24px of gap spacing. Defaults to DEFAULT_GAP.
  children: ReactNode;
};

// Base layout container. Creates vertical spacing between children items.
export const ContentSpacingCore: FC<ContentSpacingCoreProps> = ({ children, gap }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(gap ?? DEFAULT_GAP),
      }}
    >
      {children}
    </div>
  );
};
