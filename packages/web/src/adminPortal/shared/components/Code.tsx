import { styled } from '@mui/material';
import React from 'react';

export const CODE_HORIZONTAL_PADDING = 1;

export type CodeCoreProps = React.ComponentProps<typeof CodeCore>;

export const CodeCore = styled('span')(({ theme }) => ({
  borderRadius: 4,
  width: 'fit-content',
  padding: theme.spacing(0.5, CODE_HORIZONTAL_PADDING),
  wordBreak: 'break-word',
}));
