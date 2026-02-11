import { styled } from '@mui/material';
import React from 'react';

const StyledContainer = styled('div')(({ theme }) => ({
  background: theme.styleConfig.container.backgroundColor,
  borderStyle: 'solid',
  borderWidth: theme.styleConfig.container.borderWidth,
  borderColor: theme.styleConfig.container.borderColor,
  borderRadius: theme.styleConfig.container.borderRadius,
  color: theme.styleConfig.colors.primary,
  width: theme.styleConfig.container.width,
  padding: theme.styleConfig.container.padding,
  boxSizing: 'border-box',
}));

export const MainContainer = ({ children }: { children: React.ReactNode }) => {
  return <StyledContainer>{children}</StyledContainer>;
};
