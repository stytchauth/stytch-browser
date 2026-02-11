import React from 'react';
import { InfoIconCore, InfoIconCoreProps } from '../shared/components/InfoIcon';
import { Tooltip } from './Tooltip';

export const InfoIcon = (props: InfoIconCoreProps) => {
  return <InfoIconCore {...props} TooltipComponent={Tooltip} />;
};
