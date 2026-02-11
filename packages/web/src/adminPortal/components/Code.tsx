import { styled } from '@mui/material';
import React from 'react';

import { CodeCore } from '../shared/components/Code';

export type CodeProps = React.ComponentProps<typeof CodeCore>;

export const Code = styled(CodeCore)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.styleConfig.colors.accentText,
  backgroundColor: theme.styleConfig.colors.accent,
}));
