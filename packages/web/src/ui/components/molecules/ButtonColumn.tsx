import React, { ReactNode } from 'react';

import Column from '../atoms/Column';
import Divider from './Divider';

type ButtonColumnProps = { children: ReactNode } | { top: ReactNode; bottom: ReactNode };

/**
 * Codifies simple button layout patterns
 * - For a single set of buttons, use children
 * - For buttons separated by dividers, use top and bottom props
 */
const ButtonColumn = (props: ButtonColumnProps) => {
  if ('children' in props) {
    return <Column gap={2}>{props.children}</Column>;
  }

  return (
    <Column gap={4}>
      {props.top && (
        // This is a bit odd but there are screens where there's nothing directly above the divider
        <ButtonColumn>{props.top}</ButtonColumn>
      )}
      <Divider />
      <ButtonColumn>{props.bottom}</ButtonColumn>
    </Column>
  );
};

export default ButtonColumn;
