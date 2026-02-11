import React from 'react';
import { TooltipCore, TooltipCoreProps } from '../shared/components/Tooltip';
import { Typography } from './Typography';

export const Tooltip = (props: TooltipCoreProps): JSX.Element => {
  return <TooltipCore {...props} TypographyComponent={Typography} />;
};
