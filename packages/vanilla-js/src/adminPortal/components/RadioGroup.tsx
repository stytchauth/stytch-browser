import { SxProps, Theme } from '@mui/material';
import React, { FC } from 'react';
import { RadioGroupCore, RadioGroupCoreProps } from '../shared/components/RadioGroup';
import { Radio } from './Radio';

export type RadioGroupProps = RadioGroupCoreProps;

const formGroupSx: SxProps<Theme> = {
  flexDirection: 'row',
};

export const RadioGroup: FC<RadioGroupProps> = (props) => {
  return <RadioGroupCore {...props} formGroupSx={formGroupSx} RadioComponent={Radio} />;
};
