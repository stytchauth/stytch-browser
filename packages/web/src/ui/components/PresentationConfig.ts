import { logger, RUN_IN_DEV } from '@stytch/core';
import { createContext, useContext, useMemo } from 'react';

import { PresentationConfig } from '../../types';
import { IconNames } from '../b2c/components/Icons';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { IconRegistry } from './IconRegistry';
import { Theme } from './themes/ThemeConfig';
import { defaultTheme } from './themes/themes';

export type PresentationOptions = {
  /**
   * When this value is false, the header title and description text will be hidden.
   * This is useful if you prefer to display and style the title outside the Stytch component.
   */
  hideHeaderText: boolean;

  /**
   * Optional suffix for <input> id attribute so input IDs are unique.
   */
  inputIdSuffix?: string;

  /**
   * The configuration object for your custom logo.
   */
  logo?: {
    /**
     * The URL of your custom logo.
     */
    url: string;

    /**
     * Alt text for the logo. This would usually be the name of the website or your company,
     * unless this is already repeated nearby in which case this should be left empty.
     */
    alt: string;
  };

  /**
   * Set to true to add id like 'oauth-google' to buttons, or a string to add a suffix to button ids to make
   * them more unique. This exists for backwards compatibility. We do not recommend using this to style or
   * modify elements in Stytch UI.
   */
  buttonId?: string | boolean;

  /**
   * Wraps the Stytch UI components to be contained in a shadow DOM. Use this to enable style isolation.
   * @default false
   */
  enableShadowDOM?: boolean;

  /**
   * Override our icons. Currently, this only supports logos, such as those that appear in Oauth buttons.
   * This should be an object where the key is the icon name and the value is a React component
   * (not React element) with a size prop and the rest spread onto the root element.
   *
   * Note that custom logos not imported from our packages is not yet available in @stytch/vanilla-js.
   * We are looking at provide alternatives in the future.
   *
   * @example
   *
   * // Using a solid black or white icon
   * import { whiteIcons } from '@stytch/react';
   *
   * const presentation = {
   *   options: {
   *     icons: {
   *       outlook: whiteIcons.outlook,
   *     },
   *   },
   * };
   *
   * // Using a custom icon
   * const presentation = {
   *  icons: {
   *    outlook: ({ size, ...props }) => (
   *      <svg width={size} height={size} {...props}>...</svg>
   *    ),
   *  },
   * };
   */
  icons?: IconRegistry<string>;
};

const defaultOptions: PresentationOptions = {
  hideHeaderText: false,
};

/**
 * Internal type -
 * @see {PresentationConfig} is the public one
 */
export type Presentation = {
  theme: Theme;
  options: PresentationOptions;

  // Internal properties
  displayWatermark: boolean;
  iconRegistry: IconRegistry<string>;
};

export function usePresentationWithDefault(
  maybeConfig: PresentationConfig | undefined,
  displayWatermark: boolean,
  {
    products,
    enableShadowDOM,
  }: {
    products: { id: string; icons?: Partial<IconRegistry<IconNames>> }[];
    enableShadowDOM?: boolean;
  },
  productsName?: string,
): Presentation {
  const { theme, options } = maybeConfig ?? {};

  RUN_IN_DEV(() => {
    const stringProducts = products.filter((p) => typeof p === 'string');
    if (stringProducts.length > 0) {
      logger.error(
        `Please add an import for ${productsName} and update config.products to\n` +
          'products: [' +
          products.map((p) => `${productsName}.${typeof p === 'string' ? p : p.id}`).join(', ') +
          ']',
      );

      throw new Error("'config.products' should not include strings anymore");
    }
  });

  // Switch theme automatically depending on color scheme
  const isDynamic = isDynamicTheme(theme);
  const darkMode = useMediaQuery(isDynamic ? '(prefers-color-scheme: dark)' : undefined);

  let effectiveTheme: Partial<Theme> | undefined;
  if (isDynamic) {
    effectiveTheme = darkMode ? theme[1] : theme[0];
  } else {
    effectiveTheme = theme;
  }

  // Memoize the icon registry so it only need to be constructed once
  const iconRegistry = useMemo(() => {
    const registry: IconRegistry<string> = {};
    for (const product of products) {
      Object.assign(registry, product.icons);
    }
    Object.assign(registry, options?.icons);
    return registry;
  }, [products, options]);

  return {
    theme: {
      ...defaultTheme,
      ...effectiveTheme,
    },
    options: {
      enableShadowDOM,
      ...defaultOptions,
      ...options,
    },
    displayWatermark,
    iconRegistry,
  };
}

export function isDynamicTheme(
  theme: PresentationConfig['theme'],
): theme is readonly [light: Partial<Theme>, dark: Partial<Theme>] {
  return Array.isArray(theme);
}

export const PresentationContext = createContext<Presentation>(undefined!);
export const usePresentation = () => useContext(PresentationContext);

export function getButtonId(base: string, options: PresentationOptions) {
  if (options.buttonId == null || options.buttonId === false) return undefined;
  if (typeof options.buttonId === 'string') return base + options.buttonId;
  return base;
}
