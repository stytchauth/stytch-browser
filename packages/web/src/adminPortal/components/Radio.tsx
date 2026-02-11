import { styled } from '@mui/material';

import { RadioCore, RadioCoreProps } from '../shared/components/Radio';

export type { RadioCoreProps as RadioProps };

export const Radio = styled(RadioCore)(({ theme }) => ({
  color: theme.styleConfig.colors.primary,
}));
