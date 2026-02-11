export type StytchTheme = {
  backgroundColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  disabledTextColor: string;
  successColor: string;
  errorColor: string;
  socialButtonBackgroundColor: string;
  socialButtonTextColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonBorderColor: string;
  buttonBorderRadius: number;
  disabledButtonBackgroundColor: string;
  disabledButtonBorderColor: string;
  disabledButtonTextColor: string;
  inputBorderRadius: number;
  inputBorderColor: string;
  inputBackgroundColor: string;
  inputTextColor: string;
  inputPlaceholderTextColor: string;
  disabledInputBorderColor: string;
  disabledInputBackgroundColor: string;
  disabledInputTextColor: string;
  dialogTextColor: string;
  hideHeaderText: boolean;
  warningBackgroundColor: string;
  warningTextColor: string;
  logoUrl?: string;
};

export type StytchStyles = {
  darkTheme: StytchTheme;
  lightTheme: StytchTheme;
};

const CHARCOAL = '#19303D';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const SLATE = '#5C727D';
const PINE = '#0C5A56';
const MAROON = '#8B1214';
const STEEL = '#8296A1';
const CEMENT = '#ADBCC5';
const CHALK = '#F3F5F6';
const FOG = '#E5E8EB';
const MINT = '#C6FFE0';
const PEACH = '#FFD4CD';
const INK = '#354D5A';
const PINK = '#FFEEEC';
const CRIMSON = '#590607';

export const DEFAULT_DARK_THEME: StytchTheme = {
  backgroundColor: CHARCOAL,
  primaryTextColor: WHITE,
  secondaryTextColor: CEMENT,
  disabledTextColor: STEEL,
  successColor: MINT,
  errorColor: PEACH,
  socialButtonBackgroundColor: WHITE,
  socialButtonTextColor: CHARCOAL,
  buttonBackgroundColor: WHITE,
  buttonTextColor: CHARCOAL,
  buttonBorderColor: WHITE,
  buttonBorderRadius: 4,
  disabledButtonBackgroundColor: INK,
  disabledButtonBorderColor: INK,
  disabledButtonTextColor: STEEL,
  inputBorderRadius: 4,
  inputBorderColor: SLATE,
  inputBackgroundColor: CHARCOAL,
  inputTextColor: WHITE,
  inputPlaceholderTextColor: STEEL,
  disabledInputBorderColor: INK,
  disabledInputBackgroundColor: INK,
  disabledInputTextColor: STEEL,
  dialogTextColor: CHARCOAL,
  hideHeaderText: false,
  warningBackgroundColor: PINK,
  warningTextColor: CRIMSON,
};

export const DEFAULT_LIGHT_THEME: StytchTheme = {
  backgroundColor: WHITE,
  primaryTextColor: BLACK,
  secondaryTextColor: SLATE,
  disabledTextColor: STEEL,
  successColor: PINE,
  errorColor: MAROON,
  socialButtonBackgroundColor: WHITE,
  socialButtonTextColor: CHARCOAL,
  buttonBackgroundColor: CHARCOAL,
  buttonTextColor: WHITE,
  buttonBorderColor: CHARCOAL,
  buttonBorderRadius: 4,
  disabledButtonBackgroundColor: CHALK,
  disabledButtonBorderColor: CHALK,
  disabledButtonTextColor: STEEL,
  inputBorderRadius: 4,
  inputBorderColor: CEMENT,
  inputBackgroundColor: WHITE,
  inputTextColor: CHARCOAL,
  inputPlaceholderTextColor: STEEL,
  disabledInputBorderColor: FOG,
  disabledInputBackgroundColor: CHALK,
  disabledInputTextColor: STEEL,
  dialogTextColor: CHARCOAL,
  hideHeaderText: false,
  warningBackgroundColor: PINK,
  warningTextColor: CRIMSON,
};
