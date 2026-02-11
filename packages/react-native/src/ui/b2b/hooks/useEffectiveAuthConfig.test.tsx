import { AuthFlowType, B2BOAuthProviders } from '@stytch/core/public';
import { renderHook } from '@testing-library/react-native';
import React from 'react';

import { B2BProducts, DEFAULT_UI_CONFIG, StytchRNB2BUIConfig } from '../config';
import { MOCK_ORGANIZATION } from '../mocks';
import { UIState } from '../states';
import { DeepPartial, MockGlobalContextProvider } from '../testUtils';
import { useEffectiveAuthConfig } from './useEffectiveAuthConfig';
jest.mock('./useConsoleLogger', () => {
  return {
    useConsoleLogger: () => ({
      consoleLog: jest.fn(),
    }),
  };
});
const renderHookWithConfig = (config: Partial<StytchRNB2BUIConfig>, state?: DeepPartial<UIState>) =>
  renderHook(useEffectiveAuthConfig, {
    wrapper: ({ children }) => {
      const props = {
        config: {
          productConfig: {
            ...config.productConfig,
            sessionOptions: { sessionDurationMinutes: 60 },
          },
        },
        state: {
          ...state,
          authenticationState: {
            ...state?.authenticationState,
            authFlowType: AuthFlowType.Organization,
          },
        },
      };
      return <MockGlobalContextProvider {...props}>{children}</MockGlobalContextProvider>;
    },
  });

const mockConfig: StytchRNB2BUIConfig = {
  ...DEFAULT_UI_CONFIG,
  productConfig: {
    ...DEFAULT_UI_CONFIG.productConfig,
    products: [B2BProducts.emailMagicLinks, B2BProducts.passwords, B2BProducts.oauth],
    oauthOptions: {
      providers: [
        { type: B2BOAuthProviders.Google, one_tap: true },
        B2BOAuthProviders.HubSpot,
        B2BOAuthProviders.Microsoft,
      ],
    },
  },
};

describe('useEffectiveAuthConfig', () => {
  it('should return all configured products when no restrictions are in place', () => {
    const { result } = renderHookWithConfig(mockConfig);

    expect(result.current).toMatchInlineSnapshot(`
      {
        "oauthProviderSettings": [
          {
            "customScopes": [],
            "one_tap": true,
            "providerParams": {},
            "type": "google",
          },
          {
            "customScopes": [],
            "one_tap": false,
            "providerParams": {},
            "type": "hubspot",
          },
          {
            "customScopes": [],
            "one_tap": false,
            "providerParams": {},
            "type": "microsoft",
          },
        ],
        "products": [
          "emailMagicLinks",
          "passwords",
          "oauth",
        ],
      }
    `);
  });

  it('should return only the allowed products when restrictions are in place via org policy', () => {
    const { result } = renderHookWithConfig(mockConfig, {
      authenticationState: {
        organization: { ...MOCK_ORGANIZATION, auth_methods: 'RESTRICTED', allowed_auth_methods: ['magic_link'] },
      },
    });

    expect(result.current).toMatchInlineSnapshot(`
      {
        "oauthProviderSettings": [],
        "products": [
          "emailMagicLinks",
        ],
      }
    `);
  });

  it('should return only the allowed products when restrictions are in place via primary_required', () => {
    const { result } = renderHookWithConfig(mockConfig, { primaryAuthState: { primaryAuthMethods: ['magic_link'] } });

    expect(result.current).toMatchInlineSnapshot(`
      {
        "oauthProviderSettings": [],
        "products": [
          "emailMagicLinks",
        ],
      }
    `);
  });

  it('should return empty products when org restrictions yield no overlap', () => {
    const { result } = renderHookWithConfig(mockConfig, {
      authenticationState: {
        organization: { ...MOCK_ORGANIZATION, auth_methods: 'RESTRICTED', allowed_auth_methods: ['sso'] },
      },
    });

    expect(result.current).toMatchInlineSnapshot(`
      {
        "oauthProviderSettings": [],
        "products": [],
      }
    `);
  });

  it('should return allowed products when primary_required restrictions yield no overlap and org restricts auth methods', () => {
    const { result } = renderHookWithConfig(mockConfig, {
      primaryAuthState: { primaryAuthMethods: ['sso'] },
      authenticationState: {
        organization: { ...MOCK_ORGANIZATION, auth_methods: 'RESTRICTED', allowed_auth_methods: ['sso', 'password'] },
      },
    });

    expect(result.current).toMatchInlineSnapshot(`
      {
        "oauthProviderSettings": [],
        "products": [
          "sso",
        ],
      }
    `);
  });

  it('should return magic links when primary_required restrictions yield no overlap and org does not restrict auth methods', () => {
    const { result } = renderHookWithConfig(mockConfig, {
      primaryAuthState: { primaryAuthMethods: ['sso'] },
      authenticationState: { organization: { ...MOCK_ORGANIZATION, auth_methods: 'ALL_ALLOWED' } },
    });

    expect(result.current).toMatchInlineSnapshot(`
      {
        "oauthProviderSettings": [],
        "products": [
          "emailMagicLinks",
        ],
      }
    `);
  });

  it('should return allowed oauth providers when restrictions are in place', () => {
    const { result } = renderHookWithConfig(mockConfig, {
      primaryAuthState: { primaryAuthMethods: ['google_oauth', 'microsoft_oauth', 'password'] },
    });

    expect(result.current).toMatchInlineSnapshot(`
      {
        "oauthProviderSettings": [
          {
            "customScopes": [],
            "one_tap": true,
            "providerParams": {},
            "type": "google",
          },
          {
            "customScopes": [],
            "one_tap": false,
            "providerParams": {},
            "type": "microsoft",
          },
        ],
        "products": [
          "passwords",
          "oauth",
        ],
      }
    `);
  });

  it('should include allowed oauth providers when primary_required restrictions yield no overlap and org restricts auth methods', () => {
    const { result } = renderHookWithConfig(
      { productConfig: { ...DEFAULT_UI_CONFIG.productConfig, products: [B2BProducts.sso] } },
      {
        primaryAuthState: { primaryAuthMethods: ['google_oauth', 'password'] },
        authenticationState: {
          organization: {
            ...MOCK_ORGANIZATION,
            auth_methods: 'RESTRICTED',
            allowed_auth_methods: ['google_oauth', 'hubspot_oauth', 'magic_link', 'password'],
          },
        },
      },
    );

    expect(result.current).toMatchInlineSnapshot(`
      {
        "oauthProviderSettings": [
          {
            "customScopes": [],
            "one_tap": false,
            "providerParams": {},
            "type": "google",
          },
        ],
        "products": [
          "oauth",
          "passwords",
        ],
      }
    `);
  });

  it('should use stable product and provider order when deferring to restricted auth methods', () => {
    const { result } = renderHookWithConfig(
      { productConfig: { ...DEFAULT_UI_CONFIG.productConfig, products: [B2BProducts.emailMagicLinks] } },
      {
        primaryAuthState: { primaryAuthMethods: ['password', 'sso', 'google_oauth', 'microsoft_oauth'] },
        authenticationState: {
          organization: { ...MOCK_ORGANIZATION, auth_methods: 'RESTRICTED', allowed_auth_methods: ['password', 'sso'] },
        },
      },
    );

    const { result: result2 } = renderHookWithConfig(
      { productConfig: { ...DEFAULT_UI_CONFIG.productConfig, products: [B2BProducts.emailMagicLinks] } },
      {
        primaryAuthState: { primaryAuthMethods: ['microsoft_oauth', 'google_oauth', 'sso', 'password'] },
        authenticationState: {
          organization: { ...MOCK_ORGANIZATION, auth_methods: 'RESTRICTED', allowed_auth_methods: ['sso', 'password'] },
        },
      },
    );

    expect(result.current).toStrictEqual(result2.current);
  });
});
