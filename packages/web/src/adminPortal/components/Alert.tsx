import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { styled } from '@mui/material';
import React from 'react';

import { Typography } from './Typography';

const StyledAlert = styled('div')(({ theme }) => ({
  color: theme.styleConfig.colors.primary,
  padding: theme.spacing(1.5, 3),
  backgroundColor: theme.styleConfig.colors.accent,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const Alert = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledAlert>
      <ReportProblemOutlinedIcon style={{ fontSize: 16 }} />
      <Typography variant="body2">{children}</Typography>
    </StyledAlert>
  );
};
