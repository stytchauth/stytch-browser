import CheckIcon from '@mui/icons-material/CheckRounded';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RemoveIcon from '@mui/icons-material/RemoveRounded';
import { Select as MuiSelect, SelectChangeEvent, SxProps, Theme, styled } from '@mui/material';
import React, { MouseEventHandler, ReactNode } from 'react';
import { useUniqueId } from '../../../utils/uniqueId';
import { InjectedComponents } from './componentInjection';
import { DEFAULT_GRID_COLUMN_WIDTH } from './constants';
import { OptionItem } from './types';

const MULTISELECT_VALUE = 'all_values';

export const SelectContainer = styled('div')<{ fullWidth?: boolean; readOnly?: boolean }>(
  ({ theme, fullWidth, readOnly }) => [
    {
      [theme.breakpoints.down('md')]: {
        width: '100%',
        minWidth: 'unset',
        flex: 1,
      },
      width: fullWidth ? '100%' : DEFAULT_GRID_COLUMN_WIDTH,
      minWidth: DEFAULT_GRID_COLUMN_WIDTH,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
    },
    readOnly && {
      // Need this to wrap text and ellipsis after two lines
      display: '-webkit-box',
      '-webkit-line-clamp': 2,
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden',
    },
  ],
);

type SelectItem = OptionItem & {
  Icon?: ReactNode;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLLIElement>;

  // This props is only used for the MUI Select component since the Select handles the onClick and selected props.
  // For other cases use the 'selected' prop instead.
  forceSelected?: boolean;
};

export type SelectCoreProps<U extends string | number | string[] | number[], TSelectItem> = {
  caption?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  id?: string;
  label?: ReactNode;
  menuAnchorHorizontal?: 'left' | 'right' | 'center';
  selectItems: TSelectItem[];
  multiple?: boolean;
  onChange?: (value: U) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value?: U | null;
  checkIconSx?: SxProps<Theme>;
  selectSx?: SxProps<Theme>;
};

export const SelectCore = <U extends string | number | string[] | number[], TSelectItem extends SelectItem>({
  caption,
  disabled,
  fullWidth,
  id,
  label,
  menuAnchorHorizontal,
  selectItems,
  multiple,
  onChange,
  placeholder,
  readOnly,
  required,
  value,
  checkIconSx,
  selectSx,
  LabelComponent: Label,
  MenuItemComponent: MenuItem,
  TypographyComponent: Typography,
}: SelectCoreProps<U, TSelectItem> &
  InjectedComponents<'Label' | 'Typography'> & {
    MenuItemComponent: React.ComponentType<SelectItem | TSelectItem>;
  }): JSX.Element => {
  const selectId = useUniqueId(id);

  const totalOptions = selectItems.filter((item) => !item.disabled).length;

  // If multiple = true, MUI will error if value is not an array.
  const isMultiSelect = multiple && Array.isArray(value);
  const hasMoreThanOneChild = totalOptions > 1;
  let MultiSelectIcon;
  let canSelectAll;
  if (isMultiSelect && hasMoreThanOneChild) {
    if (value.length > 0) {
      // At least 1 item has been selected
      MultiSelectIcon = RemoveIcon;
      canSelectAll = false;
    } else {
      MultiSelectIcon = DoneAllIcon;
      canSelectAll = true;
    }
  }

  const handleChange = <T,>(event: SelectChangeEvent<T>) => {
    // Don't call onChange when the 'All' multiselect value is selected.
    if (Array.isArray(event.target.value) && event.target.value.includes(MULTISELECT_VALUE)) {
      return;
    }
    onChange?.(event.target.value as U);
  };

  // Select all function called for multiselect.
  const selectAll = () => {
    if (!isMultiSelect || !hasMoreThanOneChild || !onChange) {
      return;
    }
    // Set event.target.value to be an array that includes all menu item values.
    const newValue = selectItems.filter((item) => !item.disabled).map((item) => item.value);
    onChange(newValue as U);
  };

  // Deselect all function called for multiselect.
  const deselectAll = () => {
    if (!isMultiSelect || !hasMoreThanOneChild || !onChange) {
      return;
    }
    // Set event.target.value to be empty array.
    const newValue = [] as string[] | number[];
    onChange(newValue as U);
  };

  const getRenderValue = (value: unknown): ReactNode => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    // If multiselect, render the labels of the items selected.
    if (Array.isArray(value)) {
      const valueSet = new Set(value);
      return selectItems
        .filter((item) => valueSet.has(item.value))
        .map((item) => item.label)
        .join(', ');
    }

    // Otherwise render the selected item label.
    return selectItems.find((item) => item.value === value)?.label;
  };

  // Value that will be rendered in Select input.
  const renderValue = (val: unknown): ReactNode => {
    const renderText = getRenderValue(val);
    if (!renderText) {
      // If no value, render a placeholder.
      return placeholder || 'Select option...';
    } else if (Array.isArray(val) && val.length === totalOptions && hasMoreThanOneChild) {
      // Else if all selected, render 'All'.
      return 'All';
    }

    return renderText;
  };

  const shouldDisable = disabled && !readOnly;

  return (
    <SelectContainer fullWidth={fullWidth} readOnly={readOnly}>
      {label && (
        <Label variant="caption" disabled={shouldDisable} htmlFor={selectId} required={required}>
          {label}
        </Label>
      )}
      {readOnly && <Typography>{getRenderValue(value) ?? 'None selected'}</Typography>}
      {!readOnly && (
        <>
          <MuiSelect
            sx={selectSx}
            IconComponent={ExpandMore}
            MenuProps={{
              anchorOrigin: {
                horizontal: menuAnchorHorizontal ?? 'center',
                vertical: 'bottom',
              },
              transformOrigin: {
                horizontal: 'center',
                vertical: 'top',
              },
            }}
            disableUnderline
            disabled={shouldDisable}
            displayEmpty
            fullWidth
            id={selectId}
            multiple={multiple}
            onChange={handleChange}
            renderValue={(value) => <Typography variant="body2">{renderValue(value)}</Typography>}
            value={value ?? ''}
          >
            {isMultiSelect && hasMoreThanOneChild && (
              <MenuItem
                Icon={MultiSelectIcon ? <MultiSelectIcon fontSize="small" /> : <div />}
                forceSelected={!!MultiSelectIcon}
                label={canSelectAll ? 'Select all' : 'Unselect'}
                onClick={canSelectAll ? selectAll : deselectAll}
                value={MULTISELECT_VALUE}
              />
            )}
            {selectItems.map((menuItem) => (
              <MenuItem Icon={<CheckIcon sx={checkIconSx} fontSize="small" />} key={menuItem.value} {...menuItem} />
            ))}
          </MuiSelect>
          {caption && (
            <Typography variant="caption" disabled={shouldDisable}>
              {caption}
            </Typography>
          )}
        </>
      )}
    </SelectContainer>
  );
};
