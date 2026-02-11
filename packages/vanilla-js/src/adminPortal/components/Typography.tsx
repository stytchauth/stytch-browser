import React, { FC } from 'react';
import { TypographyCore, TypographyCoreProps } from '../shared/components/Typography';

export type TypographyProps = TypographyCoreProps;

export const Typography: FC<TypographyProps> = (props) => {
  const { disabled, ...rest } = props;

  return <TypographyCore {...rest} />;
};
