import { FormGroup, SxProps, Theme } from '@mui/material';
import React from 'react';

import { useUniqueId } from '../../../utils/uniqueId';
import { InjectedComponents } from './componentInjection';
import { OptionItem } from './Radio';
import { RowItemCore } from './RowItem';

export type RadioGroupCoreProps = {
  id?: string;
  items: OptionItem[];
  onChange?(value: string): void;
  readOnly?: boolean;
  value?: string;
  formGroupSx?: SxProps<Theme>;
};

export const RadioGroupCore = ({
  id,
  items,
  onChange,
  readOnly,
  value,
  formGroupSx,
  RadioComponent: Radio,
}: RadioGroupCoreProps & InjectedComponents<'Radio'>): JSX.Element => {
  const radioGroupId = useUniqueId(id);

  const onClick = (value: string) => {
    onChange?.(value);
  };

  return (
    <RowItemCore fullWidth>
      <FormGroup sx={formGroupSx} id={radioGroupId}>
        {items.map((item) => (
          <Radio
            {...item}
            checked={item.value === value}
            disabled={item.disabled || readOnly}
            key={item.value}
            onClick={onClick}
          />
        ))}
      </FormGroup>
    </RowItemCore>
  );
};
