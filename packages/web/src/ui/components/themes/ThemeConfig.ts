export type Theme = Partial<ColorMixFallback> & {
  'color-scheme': 'light' | 'dark' | 'shadcn';

  // ----- Fonts -----
  /** Base font for all text.
   *  @default system-ui */
  'font-family': string;

  /** Font for monospace code, such as TOTP setup and recovery code.
   *  @default ui-monospace. */
  'font-family-mono': string;

  /** Header font override.
   *  @default base font-family */
  'header-font'?: string;

  // ----- Widths -----
  /** Base sizing variable. Changing this makes most spacing between elements larger or smaller.
   *  @default 4px */
  spacing: string;

  /** Max width for outer container.
   *  @default 400px */
  'container-width': string;

  /** UI components are larger to accommodate touch screens below this size
   *  @default 768px */
  'mobile-breakpoint': string;

  /** Base border radius.
   *  @default 4px */
  'rounded-base': string;

  /** Base font size.
   *  @default 1rem or 16px */
  'text-base': string;

  /** Override for button border radius
   *  @default 2x rounded-base or 8px */
  'button-radius'?: string;

  /** Override for input border radius
   *  @default 2x rounded-base or 8px */
  'input-radius'?: string;

  /** Override for outer container border radius
   *  @default 6x rounded-base or 24px */
  'container-radius'?: string;

  // ----- Styling -----
  /** Base box shadow, used for both buttons and inputs
   *  @default none */
  shadow?: string;

  'shadow-button'?: string;
  'shadow-input'?: string;

  // ----- Durations -----
  'transition-duration': string;

  // ----- Colors -----

  /** Background color of the SDK container. */
  background: string;

  /** Default font color for text in the SDK container. */
  foreground: string;

  /**
   * Your primary brand color. This will be applied to primary action buttons
   * such as form submit buttons.
   */
  primary: string;
  'primary-foreground': string;

  secondary: string;
  'secondary-foreground': string;

  /**
   * A neutral, subtle color for areas such as the unfilled part of a progress bar.
   */
  muted: string;

  /**
   * Text color contrasting with muted, and also the color used for helper and other
   * secondary text.
   */
  'muted-foreground': string;

  /**
   * Your accent brand color. This will be applied to backgrounds to draw user's attention
   * such as backup code for TOTP registration.
   */
  accent: string;
  'accent-foreground': string;

  /** Border color for the outer container and dividers */
  border: string;

  /** Border color for inputs */
  input: string;

  /** Input and button focus ring color */
  ring: string;

  /** Background and font color for destructive actions and error states.
   *  @default Red color */
  destructive: string;
  'destructive-foreground': string;

  /** Background and font color for warning states.
   *  @default Orange color */
  warning: string;

  /** Background and font color for successful states.
   *  @default Green color */
  success: string;

  /** Border color only for the outer container
   *  @default The value of border */
  'container-border'?: string;
};

/**
 * Color mix overrides -
 * These variables are constructed using color-mix() by default. If customer needs to support older browsers,
 * these values can be set using a pre-processor or JS a chroma.js polyfill
 */
export type ColorMixFallback = {
  'tab-background': string;
  'primary-button-hover': string;
  'secondary-button-hover': string;
  'destructive-button-hover': string;
  'divider-color': string;
  'focus-ring-shadow': string;
};
