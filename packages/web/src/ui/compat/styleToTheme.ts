import { logger, RUN_IN_DEV } from '@stytch/core';
import type { StyleConfig } from '@stytch/core/public';

import type { PresentationOptions } from '../components/PresentationConfig';
import type { Theme } from '../components/themes/ThemeConfig';

/* eslint-disable lingui/no-unlocalized-strings */

/**
 * Maps a legacy StyleConfig to the new Theme format.
 *
 * This is a best-effort mapping - some StyleConfig properties don't have
 * direct equivalents in Theme, and some Theme properties don't have
 * StyleConfig equivalents.
 *
 * StyleConfig properties that don't have good mappings to Theme:
 *  - inputs.placeholderColor - No equivalent (could potentially map to muted-foreground)
 *  - inputs.textColor - Mapped to foreground as approximation, but is input-specific
 *  - buttons.primary.borderColor - No specific mapping (could use border but loses specificity)
 *  - buttons.primary.borderRadius - Mapped to button-radius but loses primary-specific control
 *  - buttons.secondary.borderColor - No specific mapping (could use border but loses specificity)
 *  - buttons.secondary.borderRadius - Mapped to button-radius but loses secondary-specific control
 *  - buttons.disabled.* - No equivalents (disabled state styling not in Theme)
 *
 * Theme properties that don't have StyleConfig equivalents:
 *  - 'transition-duration' - defaulted to 0 instead of 0.15s in our new default theme
 *  - 'font-family-mono' - defaults to theme default which is system UI monospace
 *  - 'text-base' - defaults to 1rem which is close to the old font sizes
 *  - spacing - defaults to new theme default which is close but not equivalent to old spacing
 *  - shadow, 'shadow-button', 'shadow-input' - no default in new theme
 *  - foreground - Approximated from inputs.textColor but not exact
 *  - muted, 'muted-foreground'
 *  - 'accent-foreground'
 *  - ring - previously defaults to OS default focus outline color
 */
export function styleToTheme(
  styleConfig: StyleConfig,
  { silent }: { silent?: boolean } = {},
): {
  theme: Partial<Theme>;
  options: Partial<PresentationOptions>;
} {
  const warn = silent
    ? () => {
        // noop
      }
    : logger.warn;
  const error = silent
    ? () => {
        // noop
      }
    : logger.error;

  const theme: Partial<Theme> = {};
  const options: Partial<PresentationOptions> = {};

  const { colors, container, inputs, hideHeaderText, buttons, logo, fontFamily, ...outerEmpty } = styleConfig;

  // presentation.theme mapping
  // ------------------------------------------------
  RUN_IN_DEV(() => {
    warn(
      "styleToTheme: We recommend setting theme['color-scheme'] to either 'light' or 'dark' explicitly " +
        'depending on whether this is a light or dark theme. This enables icons to automatically automatically ' +
        'apply contrasting colors.',
    );

    if (Object.keys(outerEmpty).length > 0) warn('styleToTheme: Unrecognized style properties', outerEmpty);
  });

  theme['font-family'] = fontFamily;

  if (colors) {
    const { primary, secondary, success, warning, accent, error, ...expectEmpty } = colors;
    RUN_IN_DEV(() => {
      if (Object.keys(expectEmpty).length > 0) warn('styleToTheme: Unrecognized style.colors properties', expectEmpty);
    });

    Object.assign(theme, {
      primary,
      secondary,
      success,
      warning,
      accent,
      destructive: error,
    } satisfies Partial<Theme>);
  }

  if (container) {
    const { backgroundColor, borderColor, width, borderRadius, ...expectEmpty } = container;

    RUN_IN_DEV(() => {
      if (Object.keys(expectEmpty).length > 0)
        warn('styleToTheme: Unrecognized style.container properties', expectEmpty);
    });

    Object.assign(theme, {
      background: backgroundColor,
      border: borderColor,
      'container-width': width,
      // 1/4 because the new base is quite small and most components use a 2x or 4x multiplier
      'rounded-base': updateLength(borderRadius, 0.25),
    } satisfies Partial<Theme>);
  }

  if (buttons) {
    const { primary, secondary, disabled, ...expectEmpty } = buttons;

    RUN_IN_DEV(() => {
      if (Object.keys(expectEmpty).length > 0) warn('styleToTheme: Unrecognized style.buttons properties', expectEmpty);

      if (disabled && Object.keys(disabled).length > 0)
        warn('styleToTheme: buttons.disabled is no longer supported', { disabled });

      if (primary?.borderColor && primary?.backgroundColor && primary.borderColor !== primary.backgroundColor)
        error(
          "styleToTheme: primary button's border color is now always equal to background color; " +
            'having distinct colors is no longer supported',
          {
            borderColor: primary.borderColor,
            backgroundColor: primary.backgroundColor,
          },
        );

      if (secondary?.borderColor && secondary.textColor && secondary.borderColor !== secondary.textColor)
        error("styleToTheme: secondary button's border color is now always equal to text color", {
          borderColor: secondary.borderColor,
          textColor: secondary.textColor,
        });

      if (primary?.borderRadius !== secondary?.borderRadius)
        error('styleToTheme: All buttons must use the same border-radius', {
          primaryRadius: primary?.borderRadius,
          secondaryRadius: secondary?.borderRadius,
        });
    });

    // Set background and text colors
    Object.assign(theme, {
      primary: primary?.backgroundColor,
      'primary-foreground': primary?.textColor,

      secondary: secondary?.backgroundColor,
      'secondary-foreground': secondary?.textColor,
    } satisfies Partial<Theme>);

    // Set border radius
    if (primary?.borderRadius || secondary?.borderRadius) {
      // Conflicts between primary and secondary border radius is handled above
      const baseRadius = updateLength(primary?.borderRadius, 0.5) ?? updateLength(secondary?.borderRadius, 0.5);

      if (theme['rounded-base']) {
        if (theme['rounded-base'] !== baseRadius) {
          theme['button-radius'] = primary?.borderRadius;
        }
      } else {
        theme['rounded-base'] = baseRadius;
      }
    }
  }

  if (inputs) {
    const { backgroundColor, textColor, placeholderColor, borderColor, borderRadius, ...expectEmpty } = inputs;
    RUN_IN_DEV(() => {
      if (Object.keys(expectEmpty).length > 0) warn('styleToTheme: Unrecognized style.buttons properties', expectEmpty);

      if (backgroundColor && theme.background && theme.background !== backgroundColor)
        error('styleToTheme: Input now always use the container background', {
          inputBackground: backgroundColor,
          containerBackground: theme.background,
        });
    });

    Object.assign(theme, {
      foreground: textColor,
      input: borderColor,
      'muted-foreground': placeholderColor,
    } satisfies Partial<Theme>);

    // Set border radius
    if (theme['rounded-base']) {
      if (theme['rounded-base'] !== borderRadius) {
        theme['input-radius'] = borderRadius;
      }
    } else {
      theme['rounded-base'] = borderRadius;
    }
  }

  // presentation.options mapping
  // ------------------------------------------------

  options.hideHeaderText = hideHeaderText;
  if (logo?.logoImageUrl) {
    options.logo = {
      url: logo.logoImageUrl,
      alt: '',
    };

    RUN_IN_DEV(() => {
      logger.warn('styleToTheme: Please set options.logo.alt for the logo alt text for accessibility');
    });
  }

  return { theme: removeEmptyValues(theme), options: removeEmptyValues(options) };
}

function removeEmptyValues<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value != null && value !== '')) as T;
}

function updateLength(length: string | undefined, factor: number): string | undefined {
  if (!length) return length;

  // Loose check that this is a numeric and not keyword value
  const value = parseFloat(length);
  if (Number.isNaN(value)) return length;

  return `calc(${length} * ${factor})`;
}
