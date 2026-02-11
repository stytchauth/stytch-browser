import { FormControlLabel, Checkbox as MUICheckbox, SxProps, Theme, styled } from '@mui/material';
import React, { ChangeEventHandler, ReactNode } from 'react';
import { OptionItem } from './types';

const CheckboxContainer = styled(FormControlLabel)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: theme.spacing(-0.25),
  width: 'fit-content',
  gap: theme.spacing(0.5),
}));

export type CheckboxCoreProps = Omit<OptionItem, 'value' | 'label'> & {
  autoFocus?: boolean;
  checked?: boolean;
  className?: string;
  indeterminate?: boolean;
  label: ReactNode;
  onClick?: (checked: boolean, value: string) => void;
  value?: string;
  checkboxSx?: SxProps<Theme>;
};

export const CheckboxCore = ({
  autoFocus,
  checkboxSx,
  checked,
  className,
  disabled,
  indeterminate,
  label,
  onClick,
  value,
}: CheckboxCoreProps): JSX.Element => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onClick?.(e.target.checked, e.target.name);
  };

  return (
    <CheckboxContainer
      className={className}
      control={
        <MUICheckbox
          autoFocus={autoFocus}
          checked={checked}
          color="primary"
          indeterminate={indeterminate}
          name={value}
          onChange={handleChange}
          size="small"
          sx={checkboxSx}
        />
      }
      disabled={disabled}
      label={label}
    />
  );
};
