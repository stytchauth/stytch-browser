import React from 'react';
import { CodeCore } from '../shared/components/Code';
import { styled } from '@mui/material';

export type CodeProps = React.ComponentProps<typeof CodeCore>;

export const Code = styled(CodeCore)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.styleConfig.colors.accentText,
  backgroundColor: theme.styleConfig.colors.accent,
}));
