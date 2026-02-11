import { FormControlLabel, Radio as MUIRadio, radioClasses, styled } from '@mui/material';
import React, { ChangeEventHandler } from 'react';

export type OptionItem = {
  disabled?: boolean;
  label: string;
  value: string;
};

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  marginLeft: theme.spacing(-0.25),
  display: 'flex',
  alignItems: 'center',
  width: 'fit-content',
  gap: theme.spacing(0.5),
  [`&:hover, &.${radioClasses.checked}:hover`]: {
    backgroundColor: 'transparent',
  },
}));

export type RadioCoreProps = OptionItem & {
  /**
   * Whether to autofocus the radio
   */
  autoFocus?: boolean;
  /**
   * Whether the checkbox is checked
   */
  checked: boolean;
  className?: string;
  /**
   * Function to run when the radio button is clicked
   */
  onClick?: (value: string) => void;
};

export const RadioCore = ({
  autoFocus,
  checked,
  className,
  disabled,
  label,
  onClick,
  value,
}: RadioCoreProps): JSX.Element => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onClick?.(e.target.value);
  };

  return (
    <StyledFormControlLabel
      className={className}
      control={<MUIRadio autoFocus={autoFocus} checked={checked} onChange={handleChange} size="small" value={value} />}
      disabled={disabled}
      label={label}
    />
  );
};
