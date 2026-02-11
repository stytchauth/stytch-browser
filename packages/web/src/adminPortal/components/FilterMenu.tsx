import CheckIcon from '@mui/icons-material/CheckRounded';
import FilterList from '@mui/icons-material/FilterList';
import { useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { IconButtonMenu } from './IconButtonMenu';

const anchorOrigin = { horizontal: 'left', vertical: 'bottom' } as const;
const transformOrigin = { horizontal: 'left', vertical: 'top' } as const;

export interface FilterMenuProps<T = string> {
  anchorEl?: HTMLElement;
  items: readonly { label: string; value: T }[];
  value: Set<T>;
  onChange: (value: Set<T>) => void;
}

export const FilterMenu = <T extends string>({ anchorEl, items, onChange, value }: FilterMenuProps<T>) => {
  const theme = useTheme();

  const iconColor = value.size > 0 ? theme.styleConfig.colors.primary : theme.styleConfig.colors.secondary;

  const [pendingValue, setPendingValue] = useState(value);

  const actions = useMemo(
    () =>
      items.map((item) => ({
        key: item.value,
        label: item.label,
        onClick: () => {
          const newValue = new Set(pendingValue);
          if (pendingValue.has(item.value)) {
            newValue.delete(item.value);
          } else {
            newValue.add(item.value);
          }
          setPendingValue(newValue);
        },
        icon: <CheckIcon style={{ visibility: pendingValue.has(item.value) ? undefined : 'hidden' }} />,
      })),
    [items, pendingValue],
  );

  const handleOpen = useCallback(() => {
    setPendingValue(value);
  }, [value]);

  const handleClose = useCallback(() => {
    onChange(pendingValue);
  }, [onChange, pendingValue]);

  return (
    <IconButtonMenu
      actions={actions}
      anchorEl={anchorEl}
      closeOnClick={false}
      icon={<FilterList htmlColor={iconColor} />}
      item={undefined}
      idPrefix="filter_column"
      menuAnchorOrigin={anchorOrigin}
      menuTransformOrigin={transformOrigin}
      onOpen={handleOpen}
      onClose={handleClose}
    />
  );
};
