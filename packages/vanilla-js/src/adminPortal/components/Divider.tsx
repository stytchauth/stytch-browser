import { Divider as MuiDivider, styled } from '@mui/material';

export const Divider = styled(MuiDivider)(({ theme }) => ({
  borderColor: theme.styleConfig.colors.subtle,
}));
