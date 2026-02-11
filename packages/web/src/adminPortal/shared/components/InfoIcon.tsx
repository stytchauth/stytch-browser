import { InfoOutlined } from '@mui/icons-material';
import { styled } from '@mui/material';
import React from 'react';

import { InjectedComponents } from './componentInjection';

const Container = styled('div')({
  width: 'fit-content',
});

export type InfoIconCoreProps = {
  tooltipText: string;
  color?: string;
};

export const InfoIconCore = ({
  tooltipText,
  color,
  TooltipComponent: Tooltip,
}: InfoIconCoreProps & InjectedComponents<'Tooltip'>): JSX.Element => {
  return (
    <Container>
      <Tooltip text={tooltipText}>
        <InfoOutlined htmlColor={color ?? 'inherit'} fontSize="inherit" />
      </Tooltip>
    </Container>
  );
};
