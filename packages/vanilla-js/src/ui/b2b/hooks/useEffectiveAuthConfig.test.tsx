import { AuthFlowType, B2BOAuthProviders, B2BProducts, StytchB2BUIConfig } from '@stytch/core/public';
import { renderHook } from '@testing-library/preact';
import React, { ReactNode } from 'react';
import { DeepPartial, MOCK_ORGANIZATION } from '../../../testUtils';
import { MockGlobalContextProvider } from '../../flows/b2b/helpers';
import { AppState } from '../types/AppState';
import { useEffectiveAuthConfig } from './useEffectiveAuthConfig';

const renderHookWithConfig = (config: Partial<StytchB2BUIConfig>, state?: DeepPartial<AppState>) =>
  renderHook(useEffectiveAuthConfig, {
    wrapper: ({ children }) => (
      <MockGlobalContextProvider
        config={{
          authFlowType: AuthFlowType.Organization,
          sessionOptions: { sessionDurationMinutes: 60 },
          products: [],
          ...config,
        }}
        state={state}
      >
        {children as ReactNode}
      </MockGlobalContextProvider>
    ),
  });

const mockConfig = {
  products: [B2BProducts.emailMagicLinks, B2BProducts.passwords, B2BProducts.oauth],
  oauthOptions: {
    providers: [
      { type: B2BOAuthProviders.Google, one_tap: true, cancel_on_tap_outside: false },
      B2BOAuthProviders.HubSpot,
      B2BOAuthProviders.Microsoft,
    ],
  },
};

describe('useEffectiveAuthConfig', () => {
  it('should return all configured products when no restrictions are in place', () => {
    const { result } = renderHookWithConfig(mockConfig);

    expect(result.current).toMatchInlineSnapshot(`
{
  "oauthProviderSettings": [
    {
      "cancel_on_tap_outside": false,
      "customScopes": [],
      "one_tap": true,
      "providerParams": {},
      "type": "google",
    },
    {
      "cancel_on_tap_outside": undefined,
      "customScopes": [],
      "one_tap": false,
      "providerParams": {},
      "type": "hubspot",
    },
    {
      "cancel_on_tap_outside": undefined,
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
      flowState: {
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
    const { result } = renderHookWithConfig(mockConfig, { primary: { primaryAuthMethods: ['magic_link'] } });

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
      flowState: {
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
      primary: { primaryAuthMethods: ['sso'] },
      flowState: {
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
      primary: { primaryAuthMethods: ['sso'] },
      flowState: { organization: { ...MOCK_ORGANIZATION, auth_methods: 'ALL_ALLOWED' } },
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
      primary: { primaryAuthMethods: ['google_oauth', 'microsoft_oauth', 'password'] },
    });

    expect(result.current).toMatchInlineSnapshot(`
{
  "oauthProviderSettings": [
    {
      "cancel_on_tap_outside": false,
      "customScopes": [],
      "one_tap": true,
      "providerParams": {},
      "type": "google",
    },
    {
      "cancel_on_tap_outside": undefined,
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
      { products: [B2BProducts.sso] },
      {
        primary: { primaryAuthMethods: ['google_oauth', 'password'] },
        flowState: {
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
      "cancel_on_tap_outside": undefined,
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
      { products: [B2BProducts.emailMagicLinks] },
      {
        primary: { primaryAuthMethods: ['password', 'sso', 'google_oauth', 'microsoft_oauth'] },
        flowState: {
          organization: { ...MOCK_ORGANIZATION, auth_methods: 'RESTRICTED', allowed_auth_methods: ['password', 'sso'] },
        },
      },
    );

    const { result: result2 } = renderHookWithConfig(
      { products: [B2BProducts.emailMagicLinks] },
      {
        primary: { primaryAuthMethods: ['microsoft_oauth', 'google_oauth', 'sso', 'password'] },
        flowState: {
          organization: { ...MOCK_ORGANIZATION, auth_methods: 'RESTRICTED', allowed_auth_methods: ['sso', 'password'] },
        },
      },
    );

    expect(result.current).toStrictEqual(result2.current);
  });
});
