import { logger } from '@stytch/core';
import { OAuthProviders } from '@stytch/core/public';
import { renderHook } from '@testing-library/react';
import React from 'react';

import { AmazonIcon } from '../../assets/logo-color/Amazon';
import { MockGlobalContextProvider, render, screen } from '../../testUtils';
import { PresentationConfig } from '../../types';
import { OAuthButton } from '../b2c/components/OAuthButton';
import { crypto, oauth } from '../b2c/Products';
import { emailMagicLinks } from '../b2c/Products';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { PresentationContext, usePresentationWithDefault } from './PresentationConfig';
import { defaultTheme } from './themes/themes';

// Mock useMediaQuery hook
jest.mock('../hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(() => false),
}));

const mockMediaQuery = useMediaQuery as jest.Mock;

describe('usePresentationWithDefault', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaQuery.mockReturnValue(false);
  });

  it('should merge custom theme with default theme', () => {
    const config: PresentationConfig = {
      theme: {
        primary: 'red',
        background: 'blue',
      },
    };

    const { result } = renderHook(() => usePresentationWithDefault(config, false, { products: [] }));

    expect(result.current.theme).toEqual({
      ...defaultTheme,
      primary: 'red',
      background: 'blue',
    });
  });

  it('should merge custom options with default options', () => {
    const config: PresentationConfig = {
      options: {
        logo: {
          url: 'https://example.com/logo.png',
          alt: 'Company Logo',
        },
      },
    };

    const { result } = renderHook(() => usePresentationWithDefault(config, false, { products: [] }));

    expect(result.current.options).toEqual({
      hideHeaderText: false,
      logo: {
        url: 'https://example.com/logo.png',
        alt: 'Company Logo',
      },
    });
  });

  it('should use light theme when dark mode is false', () => {
    mockMediaQuery.mockReturnValue(false);

    const config: PresentationConfig = {
      theme: [{ primary: '#fff' }, { primary: '#000' }],
    };

    const { result } = renderHook(() => usePresentationWithDefault(config, false, { products: [] }));

    expect(result.current.theme.primary).toBe('#fff');
  });

  it('should use dark theme when dark mode is true', () => {
    mockMediaQuery.mockReturnValue(true);

    const config: PresentationConfig = {
      theme: [{ primary: '#fff' }, { primary: '#000' }],
    };

    const { result } = renderHook(() => usePresentationWithDefault(config, false, { products: [] }));

    expect(result.current.theme.primary).toBe('#000');
  });

  it('should set displayWatermark correctly', () => {
    const { result: result1 } = renderHook(() => usePresentationWithDefault(undefined, true, { products: [] }));
    expect(result1.current.displayWatermark).toBe(true);
  });

  describe('error handling', () => {
    it('should throw error for string products in development mode', () => {
      // Silence React uncaught exception error
      jest.spyOn(console, 'error').mockImplementation(() => {
        // noop
      });

      const loggerError = jest.spyOn(logger, 'error').mockImplementation(() => {
        // noop
      });

      const stringProducts = ['emailMagicLinks', 'oauth'] as any;

      expect(() => {
        renderHook(() => usePresentationWithDefault(undefined, false, { products: stringProducts }, 'Products'));
      }).toThrow("'config.products' should not include strings anymore");

      expect(loggerError.mock.calls[0]).toMatchInlineSnapshot(`
     [
       "Please add an import for Products and update config.products to
     products: [Products.emailMagicLinks, Products.oauth]",
     ]
    `);
    });
  });

  describe('enableShadowDOM', () => {
    it('should set enableShadowDOM to true when it exists in config', () => {
      const { result } = renderHook(() =>
        usePresentationWithDefault(undefined, false, { products: [], enableShadowDOM: true }),
      );

      expect(result.current.options.enableShadowDOM).toBe(true);
    });
  });

  describe('iconRegistry', () => {
    it('should merge icons from multiple products', () => {
      const products = [crypto, oauth];
      const { result } = renderHook(() => usePresentationWithDefault(undefined, false, { products }));

      expect(result.current.iconRegistry.coinbase).toBeDefined();
      expect(result.current.iconRegistry.amazon).toBeDefined();
    });

    it('should merge product icons with custom options icons', () => {
      const customGoogleIcon = () => 'CustomGoogleIcon';
      const customLinkedInIcon = () => 'CustomLinkedInIcon';

      const customConfig: PresentationConfig = {
        options: {
          icons: {
            linkedin: customLinkedInIcon,
            google: customGoogleIcon, // Override product icon
          },
        },
      };

      const { result } = renderHook(() => usePresentationWithDefault(customConfig, false, { products: [oauth] }));

      // Custom icons should override product icons
      expect(result.current.iconRegistry.google).toBe(customGoogleIcon);
      expect(result.current.iconRegistry.linkedin).toBe(customLinkedInIcon);
      expect(result.current.iconRegistry.amazon).toBe(AmazonIcon);
    });

    it('should preserve all unique icons from products and config', () => {
      const productIcon1 = () => 'ProductIcon1';
      const productIcon2 = () => 'ProductIcon2';
      const configIcon = () => 'ConfigIcon';

      const product = { id: 'product', icons: { google: productIcon1, amazon: productIcon2 } };
      const config: PresentationConfig = {
        options: {
          icons: {
            linkedin: configIcon,
          },
        },
      };

      const { result } = renderHook(() => usePresentationWithDefault(config, false, { products: [product] }));

      expect(result.current.iconRegistry.google).toBe(productIcon1);
      expect(result.current.iconRegistry.amazon).toBe(productIcon2);
      expect(result.current.iconRegistry.linkedin).toBe(configIcon);
    });
  });
});

describe('buttonId with PresentationContext', () => {
  const renderWithPresentation = (presentation: PresentationConfig | undefined) => {
    const Test = () => (
      <MockGlobalContextProvider config={{ products: [emailMagicLinks] }}>
        <PresentationContext.Provider value={usePresentationWithDefault(presentation, false, { products: [oauth] })}>
          <OAuthButton providerType={OAuthProviders.Google} />
        </PresentationContext.Provider>
      </MockGlobalContextProvider>
    );

    return render(<Test></Test>);
  };

  it('OAuthButton has no id when buttonId is not configured', () => {
    renderWithPresentation(undefined);

    const button = screen.getByRole('button');
    expect(button.id).toBe('');
  });

  it('OAuthButton has correct id when buttonId is true', () => {
    renderWithPresentation({ options: { buttonId: true } });

    const button = screen.getByRole('button');
    expect(button.id).toBe('oauth-google');
  });

  it('OAuthButton has correct id when buttonId is a string suffix', () => {
    renderWithPresentation({ options: { buttonId: '-test' } });

    const button = screen.getByRole('button');
    expect(button.id).toBe('oauth-google-test');
  });
});
