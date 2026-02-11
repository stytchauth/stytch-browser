import React, { FC } from 'react';

import { LabelCore, LabelCoreProps } from '../shared/components/Label';
import { Typography } from './Typography';

export type LabelProps = LabelCoreProps;

export const Label: FC<LabelProps> = (props) => <LabelCore {...props} TypographyComponent={Typography} />;
