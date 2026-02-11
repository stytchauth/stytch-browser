import {
  accordionClasses,
  accordionSummaryClasses,
  checkboxClasses,
  createTheme,
  formControlLabelClasses,
  inputBaseClasses,
  listItemButtonClasses,
  outlinedInputClasses,
  radioClasses,
  selectClasses,
  Theme,
  typographyClasses,
} from '@mui/material';
import type { PartialDeep } from '@stytch/core';
import merge from 'lodash.merge';
import React from 'react';

import { AdminPortalStyleConfig } from '../AdminPortalStyleConfig';

const DEFAULT_ADMIN_PORTAL_STYLE_CONFIG = {
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    width: '100%',
  },
  colors: {
    primary: '#000000',
    secondary: '#5C727D',
    success: '#005D26',
    error: '#BB0003',
    accent: '#ECFAFF',
    accentText: '#000000',
    subtle: '#EFEFEF',
  },
  buttons: {
    primary: {
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      borderColor: '#000000',
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      borderColor: '#000000',
    },
    disabled: {
      backgroundColor: '#EFEFEF',
      textColor: '#B4B4B4',
      borderColor: '#EFEFEF',
    },
  },
  inputs: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D9D9',
    placeholderColor: '#5C727D',
    textColor: '#000000',
  },
  borderRadius: '4px',
  fontFamily: 'Arial, Helvetica, sans-serif',
} satisfies PartialDeep<AdminPortalStyleConfig>;

export const getTheme = (styles?: PartialDeep<AdminPortalStyleConfig>): Theme => {
  const styleConfig = merge({}, DEFAULT_ADMIN_PORTAL_STYLE_CONFIG, styles);

  const resolvedConfig = {
    ...styleConfig,
    buttons: {
      primary: {
        ...styleConfig.buttons.primary,
        borderRadius: styleConfig.buttons.primary.borderRadius ?? styleConfig.borderRadius,
      },
      secondary: {
        ...styleConfig.buttons.secondary,
        borderRadius: styleConfig.buttons.secondary.borderRadius ?? styleConfig.borderRadius,
      },
      disabled: {
        ...styleConfig.buttons.disabled,
        borderRadius: styleConfig.buttons.disabled?.borderRadius ?? styleConfig.borderRadius,
      },
    },
    container: {
      ...styleConfig.container,
      borderRadius: styleConfig.container.borderRadius ?? styleConfig.borderRadius,
      borderWidth: styleConfig.container.borderWidth ?? 1,
      padding: styleConfig.container.padding ?? 48,
    },
    inputs: {
      ...styleConfig.inputs,
      borderRadius: styleConfig.inputs.borderRadius ?? styleConfig.borderRadius,
    },
  } satisfies AdminPortalStyleConfig;

  const theme = createTheme({
    typography: {
      allVariants: {
        color: resolvedConfig.colors.primary,
      },
      button: {
        textTransform: 'none',
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '250%',
      },
      fontFamily: styleConfig.fontFamily,
      h1: {
        fontSize: 24,
        fontWeight: 600,
        lineHeight: '125%',
      },
      h2: {
        fontSize: 20,
        fontWeight: 600,
        lineHeight: '125%',
      },
      h3: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '125%',
      },
      h4: {
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '150%',
      },
      h5: {
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '150%',
      },
      body1: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '150%',
      },
      body2: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: '150%',
      },
      caption: {
        fontSize: 10,
        fontWeight: 400,
        lineHeight: '120%',
      },
    },
    styleConfig: resolvedConfig,
  });

  theme.components = {
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: `1px solid ${theme.styleConfig.colors.subtle}`,
          [`&:not(.${accordionClasses.expanded}) + *`]: {
            borderWidth: '0 1px 1px',
          },
          [`&.${accordionClasses.expanded}.${accordionClasses.expanded}, &.${accordionClasses.expanded} + &.${accordionClasses.root}`]:
            {
              borderWidth: 1,
            },
          [`&.${accordionClasses.root}:before`]: {
            display: 'none',
          },
          backgroundColor: theme.styleConfig.container.backgroundColor,
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          alignItems: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          margin: theme.spacing(3, 3, 3, 7),
          padding: 0,
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          '&&': {
            minHeight: 48,
          },
          [`& .${accordionSummaryClasses.content}, & .${accordionSummaryClasses.content}.${accordionSummaryClasses.expanded}`]:
            {
              alignItems: 'center',
              display: 'flex',
              margin: theme.spacing(1.5, 0),
            },
        },
        expandIconWrapper: {
          color: theme.styleConfig.colors.primary,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
          boxShadow: 'none',
        },
        text: {
          '&:hover': {
            boxShadow: 'none',
            color: theme.styleConfig.colors.primary,
          },
          boxShadow: 'none',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        // This disables the ripple effect everywhere.
        // https://mui.com/material-ui/getting-started/faq/#how-can-i-disable-the-ripple-effect-globally
        disableRipple: true,
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 0,
          [`&:hover, &.${checkboxClasses.checked}:hover`]: {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          [theme.breakpoints.down('sm')]: {
            width: '100%',
            margin: 0,
            borderRadius: 0,
          },
          backgroundColor: theme.styleConfig.container.backgroundColor,
          borderRadius: theme.styleConfig.container.borderRadius,
          color: theme.styleConfig.colors.primary,
          width: '800px',
          maxWidth: '800px',
          margin: theme.spacing(6),
          overflow: 'auto',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          justifyContent: 'flex-start',
          padding: theme.spacing(2, 4, 4, 4),
        },
        spacing: {
          '& > :not(:first-child)': {
            marginLeft: theme.spacing(2),
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2, 4),
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: theme.spacing(4, 4, 0, 4),
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.orientation === 'vertical' &&
            ownerState.variant === 'middle' && {
              marginLeft: theme.spacing(2),
              marginRight: theme.spacing(2),
            }),
        }),
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: theme.typography.body2.fontSize,
          [`&.${formControlLabelClasses.disabled}`]: {
            color: 'inherit',
          },
        },
      },
    },
    MuiFormGroup: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(0.5),
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          padding: theme.spacing(0.5, 3, 0.5, 1),
          borderRadius: theme.shape.borderRadius,
          [`&.${listItemButtonClasses.selected}`]: {
            [`& .${typographyClasses.root}`]: {
              fontWeight: theme.typography.fontWeightBold,
            },
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 24,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: resolvedConfig.colors.primary,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: theme.styleConfig.inputs.borderColor,
        },
        root: {
          padding: 0,
          [`& .${outlinedInputClasses.notchedOutline}`]: {
            border: `1px solid ${theme.styleConfig.inputs.borderColor}`,
            borderRadius: 4,
          },
          [`&.${outlinedInputClasses.multiline}`]: {
            padding: 0,
          },
          [`& [class*="${outlinedInputClasses.input}"]`]: {
            '&::placeholder': {
              color: theme.styleConfig.inputs.placeholderColor,
              opacity: 1,
            },
            padding: theme.spacing(1),
          },
          [`&.${outlinedInputClasses.disabled} .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: theme.styleConfig.inputs.borderColor,
          },
          [`&:hover :not(.${outlinedInputClasses.error}) .${outlinedInputClasses.notchedOutline}, &.${outlinedInputClasses.focused} :not(.${outlinedInputClasses.error}) .${outlinedInputClasses.notchedOutline}`]:
            {
              borderColor: theme.styleConfig.inputs.textColor,
            },
          [`&:hover .${outlinedInputClasses.notchedOutline}, &.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
            borderWidth: 1,
          },
          [`&.${outlinedInputClasses.error}`]: {
            color: theme.styleConfig.colors.error,
          },
        },
        input: {
          height: theme.spacing(2),
          padding: theme.spacing(1),
          [`&.${outlinedInputClasses.disabled}`]: {
            WebkitTextFillColor: theme.styleConfig.colors.secondary,
          },
        },
      },
    },
    MuiPaper: {
      // For Paper (Modals, Select menus, etc.), MUI default to using the 'elevation' property to determine shadow,
      // which de-saturates colors to give the look of "elevation". We just want to use our own colors,
      // so we use the "outlined" variation, but hide the outline.
      // defaultProps: {
      //   variant: 'outlined',
      // },
      styleOverrides: {
        root: {
          backgroundColor: resolvedConfig.container.backgroundColor,
          border: '1px solid',
          borderColor: resolvedConfig.colors.subtle,
          borderRadius: resolvedConfig.container.borderRadius,
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: resolvedConfig.colors.primary,
          padding: 0,
        },
        colorPrimary: {
          [`&.${radioClasses.checked}`]: {
            color: resolvedConfig.colors.primary,
          },
          [`&.${radioClasses.disabled}`]: {
            color: resolvedConfig.colors.secondary,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          [`& .${inputBaseClasses.root}`]: {
            padding: 0,
            border: `1px solid ${theme.styleConfig.inputs.borderColor}`,
            borderRadius: theme.styleConfig.inputs.borderRadius,
          },
          [`& .${inputBaseClasses.input}`]: {
            padding: theme.spacing(1, 3, 1, 1),
          },
          [`& .${selectClasses.icon}`]: {
            color: theme.styleConfig.colors.primary,
          },
          [`& .${selectClasses.select}`]: {
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
          [`& > fieldset.${outlinedInputClasses.notchedOutline}`]: {
            borderWidth: '1px !important',
          },
          [`&:hover, &.${selectClasses.focused}`]: {
            [`> fieldset.${outlinedInputClasses.notchedOutline}`]: {
              borderColor: theme.styleConfig.inputs.textColor,
            },
          },
          [`&.${selectClasses.disabled}`]: {
            [`& .${selectClasses.icon}`]: {
              color: theme.styleConfig.colors.secondary,
            },
            [`&:hover > fieldset.${outlinedInputClasses.notchedOutline}`]: {
              borderColor: theme.styleConfig.inputs.borderColor,
            },
            borderColor: theme.styleConfig.inputs.borderColor,
          },
        },
        select: {
          height: theme.spacing(2),
          minHeight: theme.spacing(2),
          // Because we override the hight, we have to override the lineHeight to match, otherwise the text will be misaligned
          lineHeight: theme.spacing(2),
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        fontSizeSmall: {
          fontSize: 16,
        },
        fontSizeMedium: {
          fontSize: 20,
        },
        fontSizeLarge: {
          fontSize: 24,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          borderBottomColor: theme.styleConfig.colors.subtle,
          color: theme.palette.text.secondary,
          fontSize: 14,
          fontWeight: theme.typography.fontWeightRegular,
          lineHeight: '20px',
        },
        root: {
          padding: theme.spacing(0.5, 1),
          borderBottomColor: theme.styleConfig.colors.subtle,
          minWidth: 80,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: theme.styleConfig.buttons.primary.backgroundColor,
          padding: theme.spacing(1),
          borderRadius: 4,
          '& p': {
            color: theme.styleConfig.buttons.primary.textColor,
            '& > a': {
              color: theme.styleConfig.buttons.primary.textColor,
            },
          },
        },
        tooltipPlacementRight: {
          marginLeft: theme.spacing(1),
        },
        tooltipPlacementLeft: {
          marginRight: theme.spacing(1),
        },
        popper: {
          zIndex: 2000,
          maxWidth: 240,
        },
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { color: 'primary' },
          style: {
            color: resolvedConfig.colors.primary,
          },
        },
        {
          props: { color: 'textSecondary' },
          style: {
            color: resolvedConfig.colors.secondary,
          },
        },
        {
          props: { color: 'error' },
          style: {
            color: resolvedConfig.colors.error,
          },
        },
      ],
    },
  };

  return theme;
};

export const useAppTheme = (styleConfig: PartialDeep<AdminPortalStyleConfig>) =>
  React.useMemo(() => getTheme(styleConfig), [styleConfig]);
