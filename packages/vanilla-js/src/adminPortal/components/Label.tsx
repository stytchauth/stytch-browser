import React, { FC } from 'react';

import { Typography } from './Typography';
import { LabelCore, LabelCoreProps } from '../shared/components/Label';

export type LabelProps = LabelCoreProps;

export const Label: FC<LabelProps> = (props) => <LabelCore {...props} TypographyComponent={Typography} />;
