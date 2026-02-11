import React from 'react';
import { FlexBox } from './FlexBox';
import { InfoIcon } from './InfoIcon';
import { Typography } from './Typography';
import { useTheme } from '@mui/material';

export const SettingsSection = ({
  children,
  title,
  tooltipText,
  titleVariant = 'h4',
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  tooltipText?: string;
  titleVariant?: 'h4' | 'h5';
}) => {
  const theme = useTheme();

  return (
    <FlexBox flexDirection="column" gap={0.5}>
      <FlexBox alignItems="center" flexDirection="row" gap={0.5}>
        <Typography variant={titleVariant}>{title}</Typography>
        {tooltipText && <InfoIcon color={theme.styleConfig.colors.primary} tooltipText={tooltipText} />}
      </FlexBox>
      {children}
    </FlexBox>
  );
};
