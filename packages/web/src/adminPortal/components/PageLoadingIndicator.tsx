import { CircularProgress, styled } from '@mui/material';
import React from 'react';

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.styleConfig.colors.primary,
}));

export const PageLoadingIndicator = () => {
  return (
    <div
      style={{
        height: '100%',
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <StyledCircularProgress />
    </div>
  );
};
