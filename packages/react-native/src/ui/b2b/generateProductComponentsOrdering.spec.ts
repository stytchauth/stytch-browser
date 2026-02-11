import { AuthFlowType, OrganizationBySlugMatch } from '@stytch/core/public';

import { B2BProducts } from './config';
import { Component, generateProductComponentsOrdering } from './generateProductComponentsOrdering';
import { AuthenticationState } from './states';
const mockOrganization: OrganizationBySlugMatch = {
  organization_id: '',
  sso_active_connections: [
    {
      connection_id: '',
      display_name: 'sso_1',
      identity_provider: '',
    },
  ],
  organization_name: '',
  organization_logo_url: '',
  sso_default_connection_id: '',
  email_jit_provisioning: 'NOT_ALLOWED',
  email_allowed_domains: [],
  auth_methods: 'ALL_ALLOWED',
  allowed_auth_methods: [],
  mfa_policy: 'OPTIONAL',
  oauth_tenant_jit_provisioning: 'RESTRICTED',
  allowed_oauth_tenants: {},
  organization_slug: 'test-organization',
};
const mockOrganizationWithoutActiveSSO: OrganizationBySlugMatch = {
  organization_id: '',
  sso_active_connections: [],
  organization_name: '',
  organization_logo_url: '',
  sso_default_connection_id: '',
  email_jit_provisioning: 'NOT_ALLOWED',
  email_allowed_domains: [],
  auth_methods: 'ALL_ALLOWED',
  allowed_auth_methods: [],
  mfa_policy: 'OPTIONAL',
  oauth_tenant_jit_provisioning: 'RESTRICTED',
  allowed_oauth_tenants: {},
  organization_slug: 'test-organization',
};

describe('generateProductComponentsOrdering', () => {
  it('should generate component ordering correctly when displaying email magic links and passwords together', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.passwords];

    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };

    const expectedComponents = [Component.PasswordEmailCombined];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only email magic links', () => {
    const products = [B2BProducts.emailMagicLinks];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [Component.EmailForm];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only passwords', () => {
    const products = [B2BProducts.passwords];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [Component.PasswordsEmailForm];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying password and oauth', () => {
    const products = [B2BProducts.oauth, B2BProducts.passwords];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    // Different password component because > 1 product
    const expectedComponents = [Component.OAuthButtons, Component.Divider, Component.PasswordsEmailForm];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying buttons and input (discovery)', () => {
    const products = [B2BProducts.oauth, B2BProducts.emailMagicLinks];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [Component.OAuthButtons, Component.Divider, Component.EmailDiscoveryForm];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with non-discovery versions', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.sso];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [Component.EmailForm, Component.Divider, Component.SSOButtons];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with discovery versions', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.sso];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [Component.EmailDiscoveryForm, Component.Divider, Component.SSOButtons];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only buttons', () => {
    const products = [B2BProducts.oauth, B2BProducts.sso];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [Component.OAuthButtons, Component.SSOButtons];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with a divider', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.passwords, B2BProducts.oauth];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [Component.PasswordEmailCombined, Component.Divider, Component.OAuthButtons];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should not include SSO component with no valid SSO connections', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.passwords, B2BProducts.oauth, B2BProducts.sso];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganizationWithoutActiveSSO,
    };
    const expectedComponents = [Component.PasswordEmailCombined, Component.Divider, Component.OAuthButtons];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('all components (non-discovery)', () => {
    const products = [
      B2BProducts.oauth,
      B2BProducts.passwords,
      B2BProducts.emailMagicLinks,
      B2BProducts.sso,
      B2BProducts.emailOtp,
    ];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      Component.OAuthButtons,
      Component.Divider,
      Component.PasswordEmailCombined,
      Component.Divider,
      Component.SSOButtons,
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('all components (discovery)', () => {
    const products = [
      B2BProducts.oauth,
      B2BProducts.passwords,
      B2BProducts.emailMagicLinks,
      B2BProducts.sso,
      B2BProducts.emailOtp,
    ];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [
      Component.OAuthButtons,
      Component.Divider,
      Component.PasswordEmailCombinedDiscovery,
      Component.Divider,
      Component.SSOButtons,
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('passwords + oauth (org)', () => {
    const products = [B2BProducts.oauth, B2BProducts.passwords];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [Component.OAuthButtons, Component.Divider, Component.PasswordsEmailForm];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('passwords + oauth (discovery)', () => {
    const products = [B2BProducts.oauth, B2BProducts.passwords];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Discovery,
      organization: null,
    };
    const expectedComponents = [Component.OAuthButtons, Component.Divider, Component.PasswordsEmailForm];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('oauth + sso first (org)', () => {
    const products = [
      B2BProducts.oauth,
      B2BProducts.sso,
      B2BProducts.passwords,
      B2BProducts.emailMagicLinks,
      B2BProducts.emailOtp,
    ];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      Component.OAuthButtons,
      Component.SSOButtons,
      Component.Divider,
      Component.PasswordEmailCombined,
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('oauth + sso first (discovery)', () => {
    const products = [
      B2BProducts.oauth,
      B2BProducts.sso,
      B2BProducts.passwords,
      B2BProducts.emailMagicLinks,
      B2BProducts.emailOtp,
    ];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Discovery,
      organization: null,
    };
    const expectedComponents = [
      Component.OAuthButtons,
      Component.SSOButtons,
      Component.Divider,
      Component.PasswordEmailCombinedDiscovery,
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('oauth + sso last (org)', () => {
    const products = [
      B2BProducts.passwords,
      B2BProducts.emailMagicLinks,
      B2BProducts.emailOtp,
      B2BProducts.oauth,
      B2BProducts.sso,
    ];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      Component.PasswordEmailCombined,
      Component.Divider,
      Component.OAuthButtons,
      Component.SSOButtons,
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('oauth + sso last (discovery)', () => {
    const products = [
      B2BProducts.passwords,
      B2BProducts.emailMagicLinks,
      B2BProducts.emailOtp,
      B2BProducts.oauth,
      B2BProducts.sso,
    ];
    const mockState: AuthenticationState = {
      authFlowType: AuthFlowType.Discovery,
      organization: null,
    };
    const expectedComponents = [
      Component.PasswordEmailCombinedDiscovery,
      Component.Divider,
      Component.OAuthButtons,
      Component.SSOButtons,
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });
});
