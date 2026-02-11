import { SxProps, Theme, outlinedInputClasses } from '@mui/material';
import React from 'react';
import { InputCore, InputCoreProps } from '../shared/components/Input';
import { Button } from './Button';
import { CopyableText } from './CopyableText';
import { Label, LabelProps } from './Label';
import { Typography } from './Typography';

export interface InputProps extends InputCoreProps {
  labelVariant?: 'body1' | 'body2';
}

const LabelBody1 = (props: LabelProps) => <Label variant="body1" {...props} />;

const inputSx: SxProps<Theme> = {
  color: (theme) => theme.styleConfig.inputs.textColor,
  fontSize: (theme) => theme.typography.body2.fontSize,
  borderRadius: (theme) => theme.styleConfig.inputs.borderRadius,
  borderColor: (theme) => theme.styleConfig.inputs.borderColor,
  backgroundColor: (theme) => theme.styleConfig.inputs.backgroundColor,
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderRadius: (theme) => theme.styleConfig.inputs.borderRadius,
    borderColor: (theme) => theme.styleConfig.inputs.borderColor,
  },
  [`& .${outlinedInputClasses.input}`]: {
    '&::placeholder': {
      color: (theme) => theme.styleConfig.inputs.placeholderColor,
    },
  },
  [`&.${outlinedInputClasses.disabled} .${outlinedInputClasses.notchedOutline}`]: {
    borderColor: (theme) => theme.styleConfig.inputs.borderColor,
  },
  [`&:hover .${outlinedInputClasses.notchedOutline}, &.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]:
    {
      borderColor: (theme) => theme.styleConfig.inputs.textColor,
    },
  [`&.${outlinedInputClasses.error}`]: {
    color: (theme) => theme.styleConfig.colors.error,
  },
};

export const Input = ({ labelVariant, ...props }: InputProps): JSX.Element => {
  return (
    <InputCore
      {...props}
      ButtonComponent={Button}
      CopyableTextComponent={CopyableText}
      LabelComponent={labelVariant === 'body1' ? LabelBody1 : Label}
      TypographyComponent={Typography}
      inputSx={inputSx}
    />
  );
};
