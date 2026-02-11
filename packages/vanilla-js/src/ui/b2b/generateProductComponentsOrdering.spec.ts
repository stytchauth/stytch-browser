import { Component, generateProductComponentsOrdering } from './generateProductComponentsOrdering';
import { AuthFlowType, B2BProducts, OrganizationBySlugMatch } from '@stytch/core/public';
import { FlowState } from './types/AppState';
const mockOrganization: OrganizationBySlugMatch = {
  organization_id: '',
  organization_slug: 'test-org',
  sso_active_connections: [
    {
      connection_id: '',
      display_name: 'sso_1',
      identity_provider: 'generic',
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
};
const mockOrganizationWithoutActiveSSO: OrganizationBySlugMatch = {
  organization_id: '',
  organization_slug: 'test-org-2',
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
};

describe('generateProductComponentsOrdering', () => {
  it('should generate component ordering correctly when displaying email magic links and passwords together', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.passwords];

    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };

    const expectedComponents = [[Component.PasswordEmailCombined]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying email OTPs and passwords together', () => {
    const products = [B2BProducts.emailOtp, B2BProducts.passwords];

    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };

    const expectedComponents = [[Component.PasswordEmailCombined]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying email magic links, email OTPs, and passwords together', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.emailOtp, B2BProducts.passwords];

    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };

    const expectedComponents = [[Component.PasswordEmailCombined]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only email magic links', () => {
    const products = [B2BProducts.emailMagicLinks];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[Component.EmailForm]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only email OTPs', () => {
    const products = [B2BProducts.emailOtp];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[Component.EmailForm]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only passwords', () => {
    const products = [B2BProducts.passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[Component.PasswordsEmailForm]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying password and oauth', () => {
    const products = [B2BProducts.oauth, B2BProducts.passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    // Different password component because > 1 product
    const expectedComponents = [[Component.OAuthButtons], [Component.Divider], [Component.PasswordsEmailForm]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying buttons and input (discovery)', () => {
    const products = [B2BProducts.oauth, B2BProducts.emailMagicLinks];
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [[Component.OAuthButtons], [Component.Divider], [Component.EmailDiscoveryForm]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should show oauth before email input when passwords + one email method is used (discovery)', () => {
    const products = [B2BProducts.oauth, B2BProducts.emailMagicLinks, B2BProducts.passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [Component.OAuthButtons],
      [Component.Divider],
      [Component.PasswordEmailCombinedDiscovery],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should show oauth before email input when passwords + two email methods are used (discovery)', () => {
    const products = [B2BProducts.oauth, B2BProducts.emailMagicLinks, B2BProducts.emailOtp, B2BProducts.passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [Component.OAuthButtons],
      [Component.Divider],
      [Component.PasswordEmailCombinedDiscovery],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with non-discovery versions', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.sso];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[Component.EmailForm], [Component.Divider], [Component.SSOButtons]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with discovery versions', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.sso];
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [[Component.EmailDiscoveryForm], [Component.Divider], [Component.SSOButtons]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only buttons', () => {
    const products = [B2BProducts.oauth, B2BProducts.sso];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[Component.OAuthButtons, Component.SSOButtons]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying consecutive buttons', () => {
    const products = [B2BProducts.oauth, B2BProducts.sso, B2BProducts.emailMagicLinks];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [Component.OAuthButtons, Component.SSOButtons],
      [Component.Divider],
      [Component.EmailForm],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with a divider', () => {
    const products = [B2BProducts.emailMagicLinks, B2BProducts.passwords, B2BProducts.oauth];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[Component.PasswordEmailCombined], [Component.Divider], [Component.OAuthButtons]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with multiple dividers', () => {
    const products = [B2BProducts.oauth, B2BProducts.passwords, B2BProducts.sso];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [Component.OAuthButtons],
      [Component.Divider],
      [Component.PasswordsEmailForm],
      [Component.Divider],
      [Component.SSOButtons],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should not include SSO component with no valid SSO connections', () => {
    const products = [
      B2BProducts.emailMagicLinks,
      B2BProducts.passwords,
      B2BProducts.oauth,
      B2BProducts.sso,
      B2BProducts.emailOtp,
    ];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganizationWithoutActiveSSO,
    };
    const expectedComponents = [[Component.PasswordEmailCombined], [Component.Divider], [Component.OAuthButtons]];

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
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [Component.OAuthButtons],
      [Component.Divider],
      [Component.PasswordEmailCombined],
      [Component.Divider],
      [Component.SSOButtons],
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
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [Component.OAuthButtons],
      [Component.Divider],
      [Component.PasswordEmailCombinedDiscovery],
      [Component.Divider],
      [Component.SSOButtons],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('passwords + oauth', () => {
    const products = [B2BProducts.oauth, B2BProducts.passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[Component.OAuthButtons], [Component.Divider], [Component.PasswordsEmailForm]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });
});
