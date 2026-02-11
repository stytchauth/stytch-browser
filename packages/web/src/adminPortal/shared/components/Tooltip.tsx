import { styled, Tooltip as MUITooltip, TooltipProps } from '@mui/material';
import React, { ReactElement, useState } from 'react';

import { InjectedComponents } from './componentInjection';

const HoverTarget = styled('span')({ display: 'flex', cursor: 'pointer' });

export type TooltipCoreProps = {
  children: ReactElement;
  text: string;
  disabled?: boolean;
  open?: boolean;
  placement?: TooltipProps['placement'];
};

export const TooltipCore = ({
  text,
  children,
  disabled,
  open,
  placement = 'right',
  TypographyComponent: Typography,
}: TooltipCoreProps & InjectedComponents<'Typography'>): JSX.Element => {
  const [isOpen, setIsOpen] = useState(open);

  if (disabled) {
    return children;
  }

  return (
    <MUITooltip
      onClose={() => setIsOpen(false)}
      onOpen={() => setIsOpen(true)}
      open={isOpen}
      placement={placement}
      title={<Typography variant="body2">{text}</Typography>}
    >
      <HoverTarget>{children}</HoverTarget>
    </MUITooltip>
  );
};
