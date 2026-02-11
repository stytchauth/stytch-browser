import { FormControlLabel, Switch as MUISwitch, styled, switchClasses } from '@mui/material';
import React, { ChangeEventHandler, FC, MouseEventHandler } from 'react';

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: 'fit-content',
  color: theme.styleConfig.colors.primary,
}));

const StyledSwitch = styled(MUISwitch)(({ theme }) => {
  const primary = theme.styleConfig.buttons.primary.backgroundColor;
  const secondary = theme.styleConfig.colors.secondary;
  const containerBackground = theme.styleConfig.container.backgroundColor;

  return {
    width: 24,
    height: 24,
    padding: 0,
    margin: '0 8px 0 12px',
    alignItems: 'center',
    [`.${switchClasses.switchBase}`]: {
      transition: theme.transitions.create(['opacity', 'background-color']),
      marginLeft: -5,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      [`&.${switchClasses.checked}`]: {
        marginLeft: -15,
        '&:hover': {
          backgroundColor: 'transparent',
        },
        [`& + .${switchClasses.track}`]: {
          opacity: 1,
          backgroundColor: primary,
        },
        [`.${switchClasses.thumb}`]: {
          color: containerBackground,
        },
      },
      [`&.${switchClasses.disabled}`]: {
        [`& .${switchClasses.thumb}`]: {
          color: secondary,
        },
        [`& + .${switchClasses.track}`]: {
          border: '2.5px solid',
          borderColor: secondary,
          opacity: 1,
          backgroundColor: containerBackground,
        },
        [`&.${switchClasses.checked}`]: {
          [`& + .${switchClasses.track}`]: {
            opacity: 1,
            backgroundColor: secondary,
          },
          [`& .${switchClasses.thumb}`]: {
            color: containerBackground,
          },
        },
      },
    },
    [`.${switchClasses.thumb}`]: {
      height: 6,
      width: 6,
      boxShadow: 'none',
      color: primary,
      [`&.${switchClasses.checked}`]: {
        color: containerBackground,
      },
    },
    [`.${switchClasses.track}`]: {
      boxSizing: 'content-box',
      border: '2.5px solid',
      borderColor: primary,
      backgroundColor: containerBackground,
      borderRadius: 24 / 2,
      height: 8,
      opacity: 1,
    },
  };
});

export type SwitchProps = {
  checked?: boolean;
  label: string;
  onChange?(value: boolean): void;
  readOnly?: boolean;
  subtext?: string;
};

const stopPropagation: MouseEventHandler<HTMLButtonElement> = (e) => {
  e.stopPropagation();
};

export const Switch: FC<SwitchProps> = ({ checked, label, onChange, readOnly }) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e.target.checked);
  };

  return (
    <StyledFormControlLabel
      control={
        <StyledSwitch
          aria-label={`${checked ? 'Disable' : 'Enable'} ${label}`}
          checked={checked}
          disableFocusRipple
          disableRipple
          disableTouchRipple
          disabled={readOnly}
          onChange={handleChange}
          onClick={stopPropagation}
        />
      }
      disabled={readOnly}
      label={label}
    />
  );
};
